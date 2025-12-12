const { z } = require("zod");
const sanitizeString = require("../utils/validator");

const SPORT_TYPES = [
  "Futbol",
  "Basketbol",
  "Voleybol",
  "Boks",
  "Kurash",
  "Dzyudo",
  "Taekvondo",
  "Og'ir atletika",
  "Yengil atletika",
  "Suzish",
  "Tenis",
  "Stol tennisi",
  "Karate",
  "Sambo",
];

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
    ),
  description: z
    .string()
    .max(300, "Tavsif 300 belgidan oshmasligi kerak")
    .trim()
    .transform(sanitizeString)
    .optional(),
  verified: z.boolean().optional().default(false),
});

const licenseSchema = z.object({
  number: z.number().max(50).trim().toUpperCase().optional(),
  issuedBy: z.string().max(50).trim().transform(sanitizeString).optional(),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Sanani YYYY-MM-DD formatida kiriting")
    .pipe(z.coerce.date())
    .refine(
      (date) => data <= new Date(),
      "Litsenziya berilgan sana kelajakda bo‘lishi mumkin emas"
    )
    .optional(),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Sanani YYYY-MM-DD formatida kiriting")
    .pipe(z.coerce.date())
    .optional(),
});

const createCoachSchema = z
  .object({
    user: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Foydalanuvchini ID si notugri formatda"),
    experience: z
      .number()
      .int("Tagriba butun son bulishi kerak")
      .min(0, "Tajriba 0 an kam bulmasligi kerak")
      .max(50, "Yajriba 60 dan yuqori bulmasligi kerak"),
    specialization: z
      .string()
      .min(5, "Ixtisos kamida 5 ta belgi bulishi kerak")
      .max(100)
      .trim()
      .transform(sanitizeString),
    sportType: z.array(z.enum(SPORT_TYPES)),
    bio: z.string().max(500).trim().transform(sanitizeString).optional(),
    achievements: z.array(achievementsSchema).max(50).default([]).optional(),
    contact: z
      .object({
        phone: z.string().max(20).optional(),
        telegram: z
          .string()
          .max(50)
          .trim()
          .transform(sanitizeString)
          .optional(),
      })
      .optional(),
    license: licenseSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.license?.issueDate && data.license?.expiryDate) {
        return data.license.expiryDate > data.license.issueDate;
      }
      return true;
    },
    {
      message:
        "Litsenziya muddati tugash sanasi berilgan sanadan oldin bo‘lishi mumkin emas",
      path: ["licese.expiryDate"],
    }
  );

const updateCoachSchema = createCoachSchema.partial();

module.exports = {
  createCoachSchema,
  updateCoachSchema,
};
