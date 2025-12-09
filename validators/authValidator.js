const { z } = require("zod");

const uzPhoneRegex = /^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/;

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Ism 2 ta harfdan kam bulmasligi kerak")
    .max(30)
    .trim(),
  surname: z
    .string()
    .min(2, "Familiya 3 ta harfdan kam bulmasligi kerak")
    .max(30)
    .trim(),
  phone: z
    .string()
    .regex(uzPhoneRegex, "Telefon raqami +998901234567 shaklida bulishi kerak")
    .optional(),
  email: z.string().email("Email notugri formatda").optional(),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bulishi kerak"),
});
