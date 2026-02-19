import prisma from "../../../../../core/config/db.js";

/**
 * 📝 Mark Attendance (Generic for Students, Teachers, Staff)
 */
export const markAttendance = async (req, res) => {
    try {
        const { tenantId, id: markedById, type: markedByType } = req.user;
        const { userId, userType, date, status, notes } = req.body;

        if (!userId || !userType || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "User ID, User Type, Date and Status are required",
            });


        }

        // Validate userType
        const validTypes = ["STUDENT", "TEACHER", "STAFF"];
        if (!validTypes.includes(userType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User Type. Must be STUDENT, TEACHER, or STAFF",
            });
        }

        // Upsert attendance (Create or Update if already exists for that day)
        const attendance = await prisma.attendance.upsert({
            where: {
                tenantId_date_userId_userType: {
                    tenantId,
                    date: new Date(date),
                    userId,
                    userType,
                },
            },
            update: {
                status,
                notes,
                markedById,
                markedByType,
            },
            create: {
                tenantId,
                userId,
                userType,
                date: new Date(date),
                status,
                notes,
                markedById,
                markedByType,
            },
        });

        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance,
        });
    } catch (error) {
        console.error("MARK ATTENDANCE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📝 Bulk Mark Attendance
 */
export const bulkMarkAttendance = async (req, res) => {
    try {
        const { tenantId, id: markedById, type: markedByType } = req.user;
        const { attendances } = req.body; // Array of { userId, userType, date, status, notes }

        if (!Array.isArray(attendances) || attendances.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Attendance array is required",
            });
        }

        const results = await Promise.all(
            attendances.map(item =>
                prisma.attendance.upsert({
                    where: {
                        tenantId_date_userId_userType: {
                            tenantId,
                            date: new Date(item.date),
                            userId: item.userId,
                            userType: item.userType,
                        },
                    },
                    update: {
                        status: item.status,
                        notes: item.notes,
                        markedById,
                        markedByType,
                    },
                    create: {
                        tenantId,
                        userId: item.userId,
                        userType: item.userType,
                        date: new Date(item.date),
                        status: item.status,
                        notes: item.notes,
                        markedById,
                        markedByType,
                    },
                })
            )
        );

        res.json({
            success: true,
            message: `${results.length} attendance records processed`,
            results,
        });
    } catch (error) {
        console.error("BULK MARK ATTENDANCE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📝 Get Attendance Report
 */
export const getAttendanceReport = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { startDate, endDate, userType, userId } = req.query;

        const where = { tenantId };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (userType) where.userType = userType;
        if (userId) where.userId = userId;

        const attendances = await prisma.attendance.findMany({
            where,
            orderBy: { date: "desc" },
        });

        res.json({
            success: true,
            attendances,
        });
    } catch (error) {
        console.error("GET ATTENDANCE REPORT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch attendance report" });
    }
};


/**
 * 📝 Delete Attendance (Admin/SuperAdmin only)
 */
export const deleteAttendance = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Note: Middleware should handle Super Admin check, 
        // but we add tenant isolation here too.
        const result = await prisma.attendance.deleteMany({
            where: { id, tenantId },
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        res.json({
            success: true,
            message: "Attendance record removed by administrator",
        });
    } catch (error) {
        console.error("DELETE ATTENDANCE ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete attendance" });
    }
};



