const { z } = require("zod");
const sanitizeString = require("../utils/validator");

const uzPhoneRegex = /^\+998\d{9}$/;

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ism 2 ta harfdan kam bulmasligi kerak")
      .max(30)
      .trim()
      .transform((val) => sanitizeString(val)),
    surname: z
      .string()
      .min(2, "Familiya 2 ta harfdan kam bulmasligi kerak")
      .max(30)
      .trim()
      .transform((val) => sanitizeString(val)),
    birthDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Tug‘ilgan sana YYYY-MM-DD formatida bo‘lsin"
      )
      .refine((date) => {
        const birth = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 5 && age <= 70;
      }, "Yosh 5 yoshdan 70 yoshgacha bulishi mumkin"),
    gender: z
      .enum(["male", "female"], { message: "Noto‘gri gen tanlandi" })
      .default([]),
    phone: z
      .string()
      .regex(
        uzPhoneRegex,
        "Telefon raqami +998901234567 shaklida bulishi kerak"
      )
      .transform((val) => (val ? sanitizeString(val) : val))
      .optional(),
    email: z.string().email("Email notugri").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Parol kamida 8 belgi bo‘lishi shart")
      .regex(/[a-z]/, "Kichik harf bo‘lishi shart")
      .regex(/[A-Z]/, "Katta harf bo‘lishi shart")
      .regex(/[0-9]/, "Raqam bo‘lishi shart")
      .transform(sanitizeString),
    passwordConfirm: z
      .string()
      .min(8, "Parolni tasdiqlash uchun kiritilishi shart")
      .transform(sanitizeString),
    role: z
      .enum(["parent", "coach"], { message: "Notugri rol tanlandi" })
      .default("parent"),
  })
  .superRefine((data, ctx) => {
    if (!data.phone && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefon raqami yoki email kiritilishi shart",
        path: ["phone"],
      });
    }
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parollar mos kelmadi",
        path: ["passwordConfirm"],
      });
    }
  });

module.exports = registerSchema;
