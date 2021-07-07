import { Authorized, Body, Get, JsonController, NotAcceptableError, NotFoundError, Post, QueryParam } from "routing-controllers";
import { getCustomRepository, getManager, getRepository } from "typeorm";
import { validate } from "class-validator";
import { ValidationError } from "../errors/ValidationError";
import { comparePassword, createEmail, generateHash, randomInt, randomString } from "../global";
import { ResetPassword, Credentials, SignUp } from "../interface";
import { User } from "../entities/User";
import { DateTime } from "luxon";
import { UserRepository } from "../repositories/UserRepository";
import { classToPlain } from "class-transformer";
import buildUrl from "build-url";

@JsonController("/auth")
export class AuthController {

  private userRepository: UserRepository;

  constructor () {
    this.userRepository = getCustomRepository(UserRepository);
  }

  @Post("/")
  async signin(@Body({required: true}) data: Credentials): Promise<any> {
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

    return classToPlain(user);
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
    user.username = data.username;
    user.password = await generateHash(data.password);
    user.apiKey = randomString();
    this.userRepository.save(user);

    await this.sendConfirmationMail(user, data.name);
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

    await this.sendConfirmationMail(user, user.name);
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
    @Body({required: true}) data: ResetPassword
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

  private async findUser(username: string, trhowException?: boolean): Promise<User> {
    const repository = getCustomRepository(UserRepository);
    const user = await repository.findOneByUsername(username);

    if (!user && trhowException) {
      throw new NotFoundError("UserNotFound");
    }

    return user;
  }

  private async sendConfirmationMail(user: User, name: String) {
    const repository = getCustomRepository(UserRepository);

    user.confirmationToken = randomInt(6);
    user.confirmationSentAt = new Date();
    await repository.save(user);

    const email = createEmail();
    email.send({
      message: {to: user.username},
      template: "account-confirmation",
      locals: {
        name: name,
        link: buildUrl(process.env.APP_URL, {
          path: "/confirmSignup",
          queryParams: {
            username: user.username,
            token: user.confirmationToken,
          },
        }),
      },
    });
  }
}
