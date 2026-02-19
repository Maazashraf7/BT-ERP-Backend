import prisma from "../../../../../core/config/db.js";
import { uploadImage } from "../../../branding/upload.service.js";

/**
 * 📚 Add Book to a specific Library
 */
export const addBook = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { libraryId, title, author, isbn, category, quantity, description } = req.body;

        if (!libraryId || !title) {
            return res.status(400).json({ success: false, message: "Library ID and Book Title are required" });
        }

        // Verify library belongs to tenant
        const library = await prisma.library.findFirst({
            where: { id: libraryId, tenantId }
        });

        if (!library) {
            return res.status(404).json({ success: false, message: "Library not found" });
        }

        // Upload cover image if provided
        let coverImageUrl = null;
        if (req.file) {
            coverImageUrl = await uploadImage(req.file, `tenants/${tenantId}/books`);
        }

        const book = await prisma.book.create({
            data: {
                tenantId,
                libraryId,
                title,
                author,
                isbn,
                category,
                quantity: quantity ? parseInt(quantity) : 0,
                description,
                coverImageUrl,
            },
        });

        res.status(201).json({
            success: true,
            message: "Book added successfully",
            book,
        });
    } catch (error) {
        console.error("ADD BOOK ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📚 Update Book
 */
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;
        const data = req.body;

        const existing = await prisma.book.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        delete data.tenantId;
        delete data.id;

        if (data.quantity) data.quantity = parseInt(data.quantity);

        // Upload new cover image if provided
        if (req.file) {
            data.coverImageUrl = await uploadImage(req.file, `tenants/${tenantId}/books`);
        }

        const book = await prisma.book.update({
            where: { id },
            data,
        });

        res.json({
            success: true,
            message: "Book updated successfully",
            book,
        });
    } catch (error) {
        console.error("UPDATE BOOK ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update book" });
    }
};

/**
 * 📚 Delete Book
 */
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        const result = await prisma.book.deleteMany({
            where: { id, tenantId }
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Book not found or already deleted" });
        }

        res.json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
        console.error("DELETE BOOK ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete book" });
    }
};

/**
 * 📚 Get Books by Library ID
 */
export const getBooksByLibrary = async (req, res) => {
    try {
        const { libraryId } = req.params;
        const { tenantId } = req.user;

        const books = await prisma.book.findMany({
            where: { libraryId, tenantId },
            orderBy: { createdAt: "desc" }
        });

        res.json({
            success: true,
            books,
        });
    } catch (error) {
        console.error("GET BOOKS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch books" });
    }
};

/**
 * 📚 Get Single Book Details
 */
export const getBookDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        const book = await prisma.book.findFirst({
            where: { id, tenantId },
            include: { library: true }
        });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.json({
            success: true,
            book,
        });
    } catch (error) {
        console.error("GET BOOK DETAILS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch book" });
    }
};



export const AssignBook = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { bookId, studentId, studentName, classId, className, studentEmail, issueDate, dueDate } = req.body;

        if (!bookId || !studentId || !studentName || !classId || !className || !studentEmail || !issueDate || !dueDate) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const book = await prisma.book.findFirst({
            where: { id: bookId, tenantId }
        });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        const bookAssignment = await prisma.bookAssignment.create({
            data: {
                tenantId,
                bookId,
                studentId,
                studentName,
                classId,
                className,
                studentEmail,
                issueDate,
                dueDate,
            },
        });

        res.status(201).json({
            success: true,
            message: "Book assigned successfully",
            bookAssignment,
        });
    } catch (error) {
        console.error("ASSIGN BOOK ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
