import { users, type User, type InsertUser, Book, InsertBook, Order, InsertOrder } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book operations
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: Omit<InsertBook, "id">): Promise<Book>;
  updateBook(id: number, updates: Partial<Book>): Promise<Book>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: Omit<InsertOrder, "id">): Promise<Order>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private orders: Map<number, Order>;
  private userId: number;
  private bookId: number;
  private orderId: number;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.orders = new Map();
    this.userId = 1;
    this.bookId = 1;
    this.orderId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Book operations
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(bookData: Omit<InsertBook, "id">): Promise<Book> {
    const id = this.bookId++;
    const book: Book = { 
      ...bookData, 
      id,
      createdAt: new Date(),
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book> {
    const book = await this.getBook(id);
    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    const updatedBook = { ...book, ...updates };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(orderData: Omit<InsertOrder, "id">): Promise<Order> {
    const id = this.orderId++;
    const order: Order = {
      ...orderData,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }
}

export const storage = new MemStorage();
