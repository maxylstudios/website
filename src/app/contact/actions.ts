"use server";

export type EnquiryFields = {
  name?: string;
  email?: string;
  message?: string;
};

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: EnquiryFields;
  values?: EnquiryFields;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const fieldErrors: EnquiryFields = {};

  if (name.length < 2 || name.length > 80) {
    fieldErrors.name = "Give a name between 2 and 80 characters.";
  }

  if (!emailPattern.test(email) || email.length > 120) {
    fieldErrors.email = "Use a valid email address.";
  }

  if (message.length < 10 || message.length > 2000) {
    fieldErrors.message = "Write a message between 10 and 2000 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the fields and try again.",
      fieldErrors,
      values: { name, email, message },
    };
  }

  // Accepted on the server only. Connect a mail provider here before going live.
  return {
    status: "success",
    message:
      "Received. This starter checks the enquiry on the server, and it does not email anyone yet.",
  };
}
