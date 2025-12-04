const { z } = require("zod");

const uzPhoneRegrex = /^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/;

const achievementsSchema = z.object({
  title: z
    .string()
    .min(3, "Yutuq nomi kamida 3 ta belgidan iborat bulishi zarur")
    .max(100, "Yutuq nomi 100 ta belgidan oshmasligi kerak"),
  year: z
    .number()
    .int()
    .min(1940, "Yil 1940 dan past bulmasligi kerak")
    .max(
      new Date().getFullYear() + 1,
      "Kelajakdagi yutuqlarni kiritib bulmaydi"
    ),
  description: z
    .string()
    .max(300, "Tavsif 300 belgidan oshmasligi kerak")
    .optional(),
  verified: z.boolean().optional().default(false),
});

const createSportsmanSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 ta harfdan iborat bulishi kerak")
    .max(40, "Ism juda uzun")
    .trim(),
  surname: z
    .string()
    .min(2, "Familiya kiritilishi shart")
    .max(40, "Familiya juda uzun")
    .trim(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tug‘ilgan sana YYYY-MM-DD formatida bo‘lsin")
    .refine((date) => {
      const d = new Date(date);
      const age = new Date().getFullYear() - d.getFullYear();
      return age >= 5 && age <= 70;
    }, "Yosh 5 yoshdan 70 yoshgacha bulishi mumkin"),
});
