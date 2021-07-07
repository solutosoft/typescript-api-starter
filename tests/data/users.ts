import { DateTime } from "luxon";

export default [
  {
    id: "user",
    username: "user@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "userApiKey",
    confirmationToken: "userConfirmationToken",
    confirmedAt: new Date(),
    resetToken: "resetToken",
    resetSentAt: DateTime.now().toJSDate(),
  },{
    id: "expired-confirmation-user",
    username: "expiredconfirmation@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "expiredConfirmationApiKey",
    confirmationToken: "expiredConfirmationToken",
    confirmationSentAt: DateTime.now().minus({hours: 6}).toJSDate(),
  },{
    id: "expired-reset-user",
    username: "expiredreset@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "expiredResetApiKey",
    resetToken: "expiredResetToken",
    resetSentAt: DateTime.now().minus({hours: 25}).toJSDate(),
  },{
    id: "inactive-user",
    username: "inactive@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "inactiveApiKey",
    confirmedAt: new Date(),
  },{
    id: "not-confirmed-user",
    username: "notconfirmed@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "notConfirmedApiKey",
    confirmationToken: "notConfirmedToken",
  },
];
