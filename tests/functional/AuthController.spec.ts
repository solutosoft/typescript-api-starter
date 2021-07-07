import { StatusCodes } from "http-status-codes";
import { getCustomRepository } from "typeorm";
import { runSeeder, tearDownDatabase } from "typeorm-seeding";
import { createSupertest, setupDatabase } from "../helpers";
import { UserRepository } from "../../src/repositories/UserRepository";
import CreateUsers from "../seeds/CreateUsers";

describe("Authentication", () => {

  const supertest = createSupertest();
  let userRepository: UserRepository;

  beforeEach(async () => {
    await setupDatabase();
    await runSeeder(CreateUsers);

    userRepository = getCustomRepository(UserRepository);
  });

  afterAll(async () => {
    await tearDownDatabase();
  });

  test("should respond 200 with existance result", async () => {
    const usernames = new Map<string, boolean>([
      ["user@test.com", true],
      ["notexists@test.com", false],
    ]);

    for (const [key, value] of usernames) {
      const response = await supertest.get("/auth/exists")
        .query({username: key})
        .set("x-api-key", process.env.APP_KEY)
        .expect("Content-Type", /json/)
        .expect(StatusCodes.OK);

      expect(response.body).toEqual(value);
    }
  });

  test("should respond with 422 when body content has invalid attributes", async () => {
    const response = await supertest.post("/auth/signup")
      .set({"x-api-key": process.env.APP_KEY})
      .send({ name: ""})
      .expect("Content-Type", /json/)
      .expect(StatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toEqual({
      name:  {
        isNotEmpty: "name should not be empty",
      },
      password: {
        isNotEmpty: "password should not be empty",
        isString: "password must be a string",
      },
      username: {
        isNotEmpty: "username should not be empty",
        isString: "username must be a string",
      },
    });
  });


  test("should respond with 406 when username already exists", async () => {
    await supertest.post("/auth/signup")
      .set({"x-api-key": process.env.APP_KEY})
      .send({
        name: "John Smith",
        username: "user@test.com",
        password: "12345678",
      })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.NOT_ACCEPTABLE);
  });

  test("should respond with 204 when signup is successful", async () => {
    await supertest.post("/auth/signup")
      .set({"x-api-key": process.env.APP_KEY})
      .send({
        name: "John Smith",
        username: "newuser@test.com",
        password: "12345678",
      })
      .expect(StatusCodes.NO_CONTENT);
  });

  test("should respond with 404 when user does not exists", async () => {
    await supertest.post("/auth/recovery")
      .set({"x-api-key": process.env.APP_KEY})
      .query({username: "notfound@test.com"})
      .expect(StatusCodes.NOT_FOUND);
  });

  test("should respond with 204 when recovery email is sent successfully", async () => {
    const email = "user@test.com";

    await supertest.post("/auth/recovery")
      .set({"x-api-key": process.env.APP_KEY})
      .query({username: email})
      .expect(StatusCodes.NO_CONTENT);

      const user = await userRepository.findOneByUsername(email);
      expect(user).toBeTruthy();
  });

  test("should respond with 204 and regenerate recovery email token", async () => {
    const token = "123456";

    let user = await userRepository.findOne("user");
    user.resetToken = token;
    await userRepository.save(user);

    await supertest.post("/auth/recovery")
      .set({"x-api-key": process.env.APP_KEY})
      .query({username: user.username})
      .expect(StatusCodes.NO_CONTENT);

    user = await userRepository.findOneByUsername(user.username);
    expect(user).toBeTruthy();
    expect(user.resetToken).not.toEqual(token);
  });

  test("should respond with 422 when body has is invalid content", async () => {
    await supertest.post("/auth/reset")
      .set({"x-api-key": process.env.APP_KEY})
      .send({token: 123})
      .expect(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  test("should respond with 404 when password reset token does not exists", async () => {
    await supertest.post("/auth/reset")
      .set({"x-api-key": process.env.APP_KEY})
      .send({
        token: "abcdef",
        password: "123456",
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  test("should respond with 406 when password reset token is expired", async () => {
    await supertest.post("/auth/reset")
      .set({"x-api-key": process.env.APP_KEY})
      .send({
        token: "expiredResetToken",
        password: "123456",
      })
      .expect(StatusCodes.NOT_ACCEPTABLE);
  });

  test("should respond with 200 password has been changed successfully", async() => {
    const response = await supertest.post("/auth/reset")
      .set({"x-api-key": process.env.APP_KEY})
      .send({
        token: "resetToken",
        password: "123456",
      })
      .expect(StatusCodes.OK);

    expect(response.body).toEqual("user@test.com");
  });

  test("should respond with 404 when confirmation username does not exists", async () => {
    await supertest.post("/auth/confirmation")
      .set({"x-api-key": process.env.APP_KEY})
      .query({
        username: "notexists@test.com",
        token: "abcdef",
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  test("should respond with 406 when username is already confirmed", async () => {
    const response = await supertest.post("/auth/confirmation")
      .set({"x-api-key": process.env.APP_KEY})
      .query({
        username: "user@test.com",
        token: "abcdef",
      })
      .expect(StatusCodes.NOT_ACCEPTABLE);

    expect(response.body.message).toEqual("UserAlreadyConfirmed");
  });

  test("should respond with 406 when confirmation token is invalid", async () => {
    const response = await supertest.post("/auth/confirmation")
      .set({"x-api-key": process.env.APP_KEY})
      .query({
        username: "notconfirmed@test.com",
        token: "invalid",
      })
      .expect(StatusCodes.NOT_ACCEPTABLE);

      expect(response.body.message).toEqual("InvalidToken");
  });

  test("should respond with 406 when confirmation token is expired", async () => {
    const response = await supertest.post("/auth/confirmation")
      .set({"x-api-key": process.env.APP_KEY})
      .query({
        username: "expiredconfirmation@test.com",
        token: "expiredConfirmationToken",
      })
      .expect(StatusCodes.NOT_ACCEPTABLE);

    expect(response.body.message).toEqual("expiredConfirmationToken");
  });

  test("should respond with 204 when confirmation email successful", async () => {
    const email = "notconfirmed@test.com";

    await supertest.post("/auth/confirmation")
      .set({"x-api-key": process.env.APP_KEY})
      .query({
        username: email,
        token: "notConfirmedToken",
      })
      .expect(StatusCodes.NO_CONTENT);

      const repository = getCustomRepository(UserRepository);
      const user = await repository.findOneByUsername(email);
      expect(user.confirmedAt).toBeTruthy();
  });

  test("should respond with 422 when body is invalid", async () => {
    await supertest.post("/auth")
      .send({username: "notexists@test.test"})
      .expect(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  test("should respond with 404 when user not found", async () => {
    const response = await supertest.post("/auth")
      .send({
        username: "notexists@test.com",
        password: "123456",
      })
      .expect(StatusCodes.NOT_FOUND);

      expect(response.body.message).toEqual("UserNotFound");
  });

  test("should respond with 406 when password is invalid", async () => {
    const response = await supertest.post("/auth")
      .send({
        username: "user@test.com",
        password: "invalid",
      })
      .expect(StatusCodes.NOT_ACCEPTABLE);

    expect(response.body.message).toEqual("InvalidUsernameAndPassword");
  });

  test("should respond with 200 when username and password are correct", async () => {
    const response = await supertest.post("/auth")
      .send({
        username: "user@test.com",
        password: "123456",
      })
      .expect(StatusCodes.OK);

    expect(response.body).toEqual(expect.objectContaining({
      apiKey: "userApiKey",
    }));
  });

});
