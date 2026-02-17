import { Router } from "express";
import {
    createLibrary,
    updateLibrary,
    deleteLibrary,
    listLibraries,
    getLibrary
} from "./library.controller.js";
import {
    addBook,
    updateBook,
    deleteBook,
    getBooksByLibrary,
    getBookDetails
} from "./book.controller.js";

import { requirePermission } from "../../../../../core/middlewares/permission.middleware.js";
import { checkDomainInPlan } from "../../../../../core/middlewares/fetures.middleware.js";

const router = Router();

// Routes are already protected by tenantRouter middleware (authMiddleware and checkSubscription)
router.use(checkDomainInPlan("ACADEMIC"));

// 🏛️ Library Management (CRUD)
router.post("/", requirePermission("CREATE_LIBRARY"), createLibrary);
router.get("/", requirePermission("GET_ALL_LIBRARIES"), listLibraries);
router.get("/:id", requirePermission("GET_LIBRARY_BY_ID"), getLibrary);
router.put("/:id", requirePermission("UPDATE_LIBRARY"), updateLibrary);
router.delete("/:id", requirePermission("DELETE_LIBRARY"), deleteLibrary);

// 📚 Book Management (CRUD within Library)
router.post("/books", requirePermission("ADD_BOOK"), addBook);
router.get("/:libraryId/books", requirePermission("GET_BOOKS_BY_LIBRARY"), getBooksByLibrary);
router.get("/books/:id", requirePermission("GET_BOOK_DETAILS"), getBookDetails);
router.put("/books/:id", requirePermission("UPDATE_BOOK"), updateBook);
router.delete("/books/:id", requirePermission("DELETE_BOOK"), deleteBook);

export default router;
