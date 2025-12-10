const { z, string, transform } = require("zod");
const validator = require("validator");

const uzPhoneRegrex = /^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/;

const sanitizeString = (val) => {
  if (typeof val !== "string") return val;
  return validator.escape(val);
};

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
    .trim()
    .transform(sanitizeString),
  surname: z
    .string()
    .min(2, "Familiya kiritilishi shart")
    .max(40, "Familiya juda uzun")
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
    .regex(uzPhoneRegrex, "Telefon raqami +998901234567 shaklida bo‘lsin")
    .optional(),
  sportType: z.enum(
    [
      "Futbol",
      "Basketbol",
      "Voleybol",
      "Boks",
      "Kurash",
      "Taekvondo",
      "Sambo",
      "Og'ir atletika",
      "Yengil atletika",
      "Suzish",
      "Tenis",
      "Stol tennisi",
      "Dzyudo",
      "Karate",
    ],
    { message: "Noto‘g‘ri sport turi tanlandi" }
  ),
  coach: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Murabbiy ID si noto‘g‘ri formatda"),
  height: z
    .number()
    .min(100, "Bo‘y 100 sm dan kam bo‘lmasligi kerak")
    .max(230, "Bo‘y 230 sm dan oshmasligi kerak"),
  weight: z
    .number()
    .min(30, "Vazn 30 kg dan kam bo‘lmasligi kerak")
    .max(200, "Vazn 200 kg dan oshmasligi kerak"),
  category: z
    .enum(["Yoshlar", "Kattalar", "Veteran", "Professional", "Amateur"])
    .default("Yoshlar"),
  achievements: z
    .array(achievementsSchema)
    .max(50, "Yutuqlar soni 50 tadan oshmasligi kerak")
    .default([]),
  medicalInfo: z
    .object({
      bloodType: z
        .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
        .optional(),
      allergies: z.array(z.string()).default([]),
      chronicDiseases: z.array(z.string()).default([]),
      lastMedicalCheck: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Sanani YYYY-MM-DD formatida kiriting")
        .optional(),
    })
    .optional(),
});

const updateSportsmanSchema = createSportsmanSchema.partial().extend({
  coach: z
    .string()
    .length(24)
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

module.exports = {
  createSportsmanSchema,
  updateSportsmanSchema,
};
