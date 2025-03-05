import axios from 'axios';

const baseUrl = 'https://api.airtable.com/v0/' + process.env.REACT_APP_AIRTABLE_BASE_ID + '/' + process.env.REACT_APP_AIRTABLE_TABLE_ID;

export const fetchArticles = async () => {
  try {
    const response = await axios.get(baseUrl, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
      },
    });
    return response.data.records;
  } catch (error) {
    console.error("Error fetching articles", error);
    throw error;
  }
};

export const addArticle = async (articleData) => {
  try {
    const response = await axios.post(
      baseUrl,
      {
        fields: articleData,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; // Return the added article's data
  } catch (error) {
    console.error("Error adding article", error);
    throw error;
  }
};

export const deleteArticle = async (articleId) => {
  try {
    const response = await axios.delete(`${baseUrl}/${articleId}`, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting article", error);
    throw error;
  }
};
