export const stores = [{
    name: "expenses",
    options: { autoIncrement: true },
    indexes: [
        { name: "category", keyPath: "category", unique: false },
        { name: "subcategory", keyPath: "subcategory", unique: false },
        { name: "date", keyPath: "date", unique: false }
    ]
}];