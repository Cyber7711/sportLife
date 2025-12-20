const { z } = require("zod");
const sanitizeString = require("../utils/validator");

const achievementsSchema = z.object({
  title: z
    .string()
    .min(3, "Yutuq nomi kamida 3 ta belgidan iborat bulishi zarur")
    .max(100, "Yutuq nomi 100 ta belgidan oshmasligi kerak")
    .trim()
    .transform(sanitizeString),
  year: z
    .number()
    .int()
    .min(1940, "Yil 1940 dan past bulmasligi kerak")
    .max(
      new Date().getFullYear() + 1,
      "Kelajakdagi yutuqlarni kiritib bulmaydi"
    )
    .int(),

  description: z
    .string()
    .max(300, "Tavsif 300 belgidan oshmasligi kerak")
    .trim()
    .optional()
    .transform(sanitizeString),
  verified: z.boolean().optional().default(false),
});

const createSportsmanSchema = z.object({
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
    .regex(/^[0-9a-fA-F]{24}$/, "Murabbiy ID si noto‘g‘ri formatda")
    .optional(),
  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Parent ID si noto‘g‘ri formatda")
    .optional(),
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
