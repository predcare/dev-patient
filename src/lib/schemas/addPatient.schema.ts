import * as yup from "yup";

export const BasicInfoSchema = yup.object().shape({
  selectionMode: yup
    .string()
    .oneOf(["create_new", "existing_user"])
    .default("create_new")
    .required("Selection mode is required"),
  selected_user_id: yup
    .number()
    .nullable()
    .when("selectionMode", {
      is: "existing_user",
      then: schema => schema.required("Please select an existing user"),
      otherwise: schema => schema.optional().nullable(),
    }),
  assigned_doctor_id: yup
    .string()
    .required("Assigned doctor ID is required"),
  profile_image: yup.string().optional().nullable(),
  name: yup
    .string()
    .trim()
    .when("selectionMode", {
      is: "create_new",
      then: schema => schema.required("Full name is required"),
      otherwise: schema => schema.optional(),
    }),
  date_of_birth: yup.date().optional(),
  gender: yup
    .string()
    .when("selectionMode", {
      is: "create_new",
      then: schema => schema.required("Gender is required"),
      otherwise: schema => schema.optional(),
    }),
  blood_group: yup.string().optional(),
  status: yup
    .string()
    .oneOf(["active", "inactive"])
    .default("active"),
});


export const MedicalInfoSchema = yup.object().shape({
  medical_history: yup.string().optional(),
});


export const ContactInfoSchema = yup.object().shape({
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .test(
      "is-10-digits",
      "Phone number must be 10 digits",
      val => !!val && /^\d{10}$/.test(val.replace(/\D/g, "")),
    ),
  email: yup
    .string()
    .trim()
    .optional()
    .test(
      "is-valid-email",
      "Enter a valid email address",
      val => !val || yup.string().email().isValidSync(val),
    ),
  alternate_number: yup
    .string()
    .trim()
    .optional()
    .test(
      "is-alt-10-digits",
      "Alternate number must be 10 digits",
      val => !val || /^\d{10}$/.test(val.replace(/\D/g, "")),
    ),
  whatsapp_number: yup
    .string()
    .trim()
    .optional()
    .test(
      "is-wa-10-digits",
      "WhatsApp number must be 10 digits",
      val => !val || /^\d{10}$/.test(val.replace(/\D/g, "")),
    ),
  address: yup.string().trim().required("Address is required"),
  country: yup.string().trim().required("Country is required"),
  state: yup.string().optional(),
  city: yup.string().optional(),
  postal_code: yup.string().optional(),
});


export const AddPatientSchema = yup.object().shape({
  selectionMode: yup
    .string()
    .oneOf(["create_new", "existing_user"])
    .default("create_new")
    .required("Selection mode is required"),
  selected_user_id: yup
    .number()
    .nullable()
    .when("selectionMode", {
      is: "existing_user",
      then: schema => schema.required("Please select an existing user"),
      otherwise: schema => schema.optional().nullable(),
    }),
  assigned_doctor_id: yup
    .string()
    .required("Assigned doctor ID is required"),
  profile_image: yup.string().optional().nullable(),

  // Basic Info
  name: yup
    .string()
    .trim()
    .when("selectionMode", {
      is: "create_new",
      then: schema => schema.required("Full name is required"),
      otherwise: schema => schema.optional(),
    }),
  date_of_birth: yup.date().optional(),
  gender: yup
    .string()
    .when("selectionMode", {
      is: "create_new",
      then: schema => schema.required("Gender is required"),
      otherwise: schema => schema.optional(),
    }),
  blood_group: yup.string().optional(),
  status: yup
    .string()
    .oneOf(["active", "inactive"])
    .default("active"),

  // Medical Info
  medical_history: yup.string().optional(),

  // Contact Info
  phone: yup
    .string()
    .trim()
    .when("selectionMode", {
      is: "create_new",
      then: schema =>
        schema
          .required("Phone number is required")
          .test(
            "is-10-digits",
            "Phone number must be 10 digits",
            val => !!val && /^\d{10}$/.test(val.replace(/\D/g, "")),
          ),
      otherwise: schema => schema.optional(),
    }),
  email: yup
    .string()
    .trim()
    .optional()
    .test(
      "is-valid-email",
      "Enter a valid email address",
      val => !val || yup.string().email().isValidSync(val),
    ),
  alternate_number: yup
    .string()
    .trim()
    .optional()
    .test(
      "is-alt-10-digits",
      "Alternate number must be 10 digits",
      val => !val || /^\d{10}$/.test(val.replace(/\D/g, "")),
    ),
  whatsapp_number: yup
    .string()
    .trim()
    .optional()
    .test(
      "is-wa-10-digits",
      "WhatsApp number must be 10 digits",
      val => !val || /^\d{10}$/.test(val.replace(/\D/g, "")),
    ),
  address: yup
    .string()
    .trim()
    .when("selectionMode", {
      is: "create_new",
      then: schema => schema.required("Address is required"),
      otherwise: schema => schema.optional(),
    }),
  country: yup
    .string()
    .trim()
    .when("selectionMode", {
      is: "create_new",
      then: schema => schema.required("Country is required"),
      otherwise: schema => schema.optional(),
    }),
  state: yup.string().optional(),
  city: yup.string().optional(),
  postal_code: yup.string().optional(),
});

export type TBasicInfoSchemaType = yup.InferType<typeof BasicInfoSchema>;
export type TMedicalInfoSchemaType = yup.InferType<typeof MedicalInfoSchema>;
export type TContactInfoSchemaType = yup.InferType<typeof ContactInfoSchema>;
export type TAddPatientSchemaType = yup.InferType<typeof AddPatientSchema>;
