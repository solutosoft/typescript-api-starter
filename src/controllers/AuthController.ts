import { Authorized, Body, Get, JsonController, NotAcceptableError, NotFoundError, Post, QueryParam } from "routing-controllers";
import { getCustomRepository, getRepository, Repository } from "typeorm";
import { validate } from "class-validator";
import { ValidationError } from "../errors/ValidationError";
import { comparePassword, generateHash, randomInt, randomString } from "../utils/hash";
import { User } from "../entities/User";
import { DateTime } from "luxon";
import { UserRepository } from "../repositories/UserRepository";
import { createJwt } from "../utils/jwt";
import { createEmail } from "../utils/email";
import { Credentials } from "../types/Credentials";
import { SignUp } from "../types/SignUp";
import { ResetPassword } from "../types/ResetPassword";
import { AuthToken } from "../types/AuthToken";
import { Token } from "../entities/Token";
import { RefreshToken } from "../types/RefreshToken";
import buildUrl from "build-url";

@JsonController("/auth")
export class AuthController {

  private userRepository: UserRepository;
  private tokenRepository: Repository<Token>;

  constructor () {
    this.userRepository = getCustomRepository(UserRepository);
    this.tokenRepository = getRepository(Token);
  }

  @Post("/")
  async signin(@Body({required: true}) data: Credentials): Promise<AuthToken> {
    const errors = await validate(data);
    if (errors.length ) {
      throw new ValidationError(errors);
    }

    const user = await this.findUser(data.username, true);
    if (!user.confirmedAt) {
      throw new NotAcceptableError("UserNotConfirmed");
    }

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      throw new NotAcceptableError("InvalidUsernameAndPassword");
    }

    return this.createToken(user);
  }

  @Authorized()
  @Get("/exists")
  async exists(
    @QueryParam("username", {required: true}) username: string
  ): Promise<boolean> {
    const user = await this.findUser(username);

    if (user && !user.confirmedAt) {
      throw new NotAcceptableError("UserNotConfirmed");
    }

    return !!user;
  }

  @Authorized()
  @Post("/signup")
  async signup(@Body({required: true}) data: SignUp): Promise<null> {
    let user = await this.findUser(data.username);

    if (user) {
      throw new NotAcceptableError("UserAlreadyExists");
    }

    const errors = await validate(data);
    if (errors.length ) {
      throw new ValidationError(errors);
    }

    user = new User();
    user.name = data.name;
    user.username = data.username;
    user.password = await generateHash(data.password);
    user.apiKey = randomString();
    this.userRepository.save(user);

    await this.sendConfirmation(user);
    return null;
  }

  @Authorized()
  @Post("/confirmation")
  async confirmation(
    @QueryParam("username", {required: true}) username: string,
    @QueryParam("token", {required: true}) token: string
  ): Promise<null> {
    const user = await this.findUser(username, true);

    if (user.confirmedAt) {
      throw new NotAcceptableError("UserAlreadyConfirmed");
    }

    if (user.confirmationToken !== token) {
      throw new NotAcceptableError("InvalidToken");
    }

    const confirmationSentAt = DateTime.fromJSDate(user.confirmationSentAt);
    const diff = DateTime.now().diff(confirmationSentAt).shiftTo("hours");
    if (diff.hours > 3) {
      throw new NotAcceptableError("expiredConfirmationToken");
    }

    const repository = getRepository(User);
    user.confirmedAt = new Date();
    await repository.save(user);
    return null;
  }

  @Authorized()
  @Post("/resend")
  async resend(
    @QueryParam("username", {required: true}) username: string
  ): Promise<null> {
    const user = await this.findUser(username, true);

    if (user.confirmedAt) {
      throw new NotAcceptableError("UserAlreadyConfirmed");
    }

    await this.sendConfirmation(user);
    return null;
  }

  @Authorized()
  @Post("/recovery")
  async recovery(
    @QueryParam("username", {required: true}) username: string
  ): Promise<null> {
    const user = await this.findUser(username, true);

    user.resetToken = randomString(60);
    user.resetSentAt = new Date();
    await this.userRepository.save(user);

    const email = createEmail();
    email.send({
      message: {to: username},
      template: "account-recovery",
      locals: {
        name: user.name,
        link: buildUrl(process.env.APP_URL, {
          path: `/reset/${encodeURI(user.resetToken)}`,
        }),
      },
    });

    return null;
  }

  @Authorized()
  @Post("/reset")
  async reset(
    @Body({required: true}) data: ResetPassword,
  ): Promise<string> {

    const errors = await validate(data);
    if (errors.length ) {
      throw new ValidationError(errors);
    }

    const user = await this.userRepository.findOne({resetToken: data.token});
    if (!user) {
      throw new NotFoundError("TokenNotFound");
    }

    const resetSentAt = DateTime.fromJSDate(user.resetSentAt);
    const diff = DateTime.now().diff(resetSentAt).shiftTo("hours");
    if (diff.hours > 24) {
      throw new NotAcceptableError("TokenExpired");
    }

    user.password = await generateHash(data.password);
    this.userRepository.save(user);

    return user.username;
  }

  @Authorized()
  @Post("/refresh")
  async refresh(
    @Body({required: true}) data: RefreshToken,
  ): Promise<AuthToken> {

    const errors = await validate(data);
    if (errors.length) {
      throw new ValidationError(errors);
    }

    const token = await this.tokenRepository.findOne({token: data.token}, {
      relations: ["user"],
    });

    if (!token) {
      throw new NotFoundError("RefreshTokenNotFound");
    }

    const createdAt = DateTime.fromJSDate(token.createdAt);
    const diff = DateTime.now().diff(createdAt).shiftTo("minutes");
    if (diff.minutes > parseInt(process.env.JWT_EXPIRATION_REFRESH)) {
      throw new NotAcceptableError("RefreshTokenExpired");
    }

    await this.tokenRepository.remove(token);
    return this.createToken(token.user);
  }

  private async createToken(user: User): Promise<AuthToken> {
    const refreshToken = randomString(64);
    const accessToken = createJwt({
      id: user.id,
      name: user.name,
      username: user.username,
    });

    this.tokenRepository.insert({
      token: refreshToken,
      user: user,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private async findUser(username: string, trhowException?: boolean): Promise<User> {
    const user = await this.userRepository.findOneByUsername(username);

    if (!user && trhowException) {
      throw new NotFoundError("UserNotFound");
    }

    return user;
  }

  private async sendConfirmation(user: User) {
    user.confirmationToken = randomInt(6);
    user.confirmationSentAt = new Date();
    await this.userRepository.save(user);

    const email = createEmail();
    email.send({
      message: {to: user.username},
      template: "account-confirmation",
      locals: {
        name: user.name,
        link: buildUrl(process.env.APP_URL, {
          path: "/confirm-signup",
          queryParams: {
            username: user.username,
            token: user.confirmationToken,
          },
        }),
      },
    });
  }
}
