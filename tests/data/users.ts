import { DateTime } from "luxon";

export default [
  {
    id: "user",
    name: "User",
    username: "user@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "userApiKey",
    confirmationToken: "userConfirmationToken",
    confirmedAt: new Date(),
    resetToken: "resetToken",
    resetSentAt: DateTime.now().toJSDate(),
  },{
    id: "expired-confirmation-user",
    name: "Expired Confirmation User",
    username: "expiredconfirmation@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "expiredConfirmationApiKey",
    confirmationToken: "expiredConfirmationToken",
    confirmationSentAt: DateTime.now().minus({hours: 25}).toJSDate(),
  },{
    id: "expired-reset-user",
    name: "Expired Reset User",
    username: "expiredreset@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "expiredResetApiKey",
    resetToken: "expiredResetToken",
    resetSentAt: DateTime.now().minus({hours: 7}).toJSDate(),
  },{
    id: "not-confirmed-user",
    name: "Not Confirmed User",
    username: "notconfirmed@test.com",
    password: "$2b$12$1BuBIeHYkFu3uQYhhJcjpO26pQ8eSRt09uq.GIODQnnZFFN1H1rfG",
    apiKey: "notConfirmedApiKey",
    confirmationToken: "notConfirmedToken",
  },
];
