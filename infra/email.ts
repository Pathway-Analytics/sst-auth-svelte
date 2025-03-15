// infra/email.ts
const emailIdentity = `sst-auth-svelte-${$app.stage}@${process.env.DOMAIN || "example.com"}`;

export const email = (() => {
  const existingEmail = sst.aws.Email.isInstance(emailIdentity);

  // re deploymemnt triggers issues with existing email identities so check
  if (existingEmail) {
    return existingEmail;
  } else {
    // you will need to check the validation email to confirm the email identity
    console.log(`Creating email identity ${emailIdentity}, validation email sent.`);
    return new sst.aws.Email("EmailServer", {
      sender: emailIdentity,
    });
  }
})();

