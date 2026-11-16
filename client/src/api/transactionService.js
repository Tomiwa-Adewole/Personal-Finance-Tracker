import API from "./axios";

export const getTransactions = async (params) => {
  const response = await API.get("/transactions", { params });
  return response.data;
};

export const getFinancialSummary = async () => {
  const response = await API.get("/transactions/summary");
  return response.data;
};

export const getCategoryBreakdown = async () => {
  const response = await API.get("/transactions/breakdown");
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await API.post("/transactions", transactionData);
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await API.put(`/transactions/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await API.delete(`/transactions/${id}`);
  return response.data;
};
