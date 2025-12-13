const { z } = require("zod");
const sanitizeString = require("../utils/validator");

const uzPhoneRegex = /^\+998\d{9}$/;

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Ism 2 ta harfdan kam bulmasligi kerak")
    .max(30)
    .trim()
    .transform(sanitizeString),
  surname: z
    .string()
    .min(2, "Familiya 3 ta harfdan kam bulmasligi kerak")
    .max(30)
    .trim()
    .transform(sanitizeString),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tug‘ilgan sana YYYY-MM-DD formatida bo‘lsin")
    .refine((date) => {
      const birth = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();

      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 5 && age <= 70;
    }, "Yosh 5 yoshdan 70 yoshgacha bulishi mumkin"),
  phone: z
    .string()
    .regex(uzPhoneRegex, "Telefon raqami +998901234567 shaklida bulishi kerak")
    .transform(sanitizeString),
  email: z.string().email("Email notugri formatda").trim().optional(),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgi bo‘lishi shart")
    .regex(/[a-z]/, "Kichik harf bo‘lishi shart")
    .regex(/[A-Z]/, "Katta harf bo‘lishi shart")
    .regex(/[0-9]/, "Raqam bo‘lishi shart")
    .transform(sanitizeString),
  passwordConfirm: z
    .string()
    .min(8, "Parolni tasdiqlash uchun kiritilishi shart"),
  role: z
    .enum(["admin", "parent", "coach"], {
      message: "Notugri rol tanlandi",
    })
    .default("parent")
    .refine((data) => data.phone || data.email, {
      message: "Telefon raqami yoki email kiritilishi shart",
      path: ["phone", "email"],
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Parollar mos kelmadi",
      path: ["passwordConfirm"],
    }),
});

module.exports = registerSchema;
