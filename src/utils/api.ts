import axios from "axios";

const API_BASE_URL = "https://latik-be.vercel.app";

export const core_services = {
  getExcelDataToday: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getExcelDatatoday`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
