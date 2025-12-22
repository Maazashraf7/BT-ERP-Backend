import prisma from "../../core/config/db.js";

export const createStudent = async (req, res) => {
  const { name, email, className } = req.body;

  const student = await prisma.student.create({
    data: {
      name,
      email,
      class: className,
      tenantId: req.user.tenantId
    }
  });

  res.status(201).json({ success: true, data: student });
};

export const listStudents = async (req, res) => {
  const students = await prisma.student.findMany({
    where: { tenantId: req.user.tenantId }
  });

  res.json({ success: true, data: students });
};
