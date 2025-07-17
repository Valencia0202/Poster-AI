// backend/server.js

// Load environment variables from .env file at the very beginning
require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors'); // Import the cors middleware

const app = express();
// Use the port from environment variables, or default to 3001
const port = process.env.PORT || 3001;

// Initialize OpenAI client with your API key
// The API key is loaded from process.env.OPENAI_API_KEY due to dotenv
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to enable CORS for all origins.
// In a production environment, you should restrict this to your frontend's domain.
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the API endpoint for poster generation
app.post('/generate-poster', async (req, res) => {
  // Extract the 'prompt' from the request body
  const { prompt } = req.body;
  const numberOfImagesToGenerate = 3; // Define how many images you want

  // Basic validation: ensure a prompt is provided
  if (!prompt) {
    console.error('Error: No prompt provided in the request.');
    return res.status(400).json({ error: 'Prompt is required to generate a poster.' });
  }

  console.log(`Received request to generate ${numberOfImagesToGenerate} posters with prompt: "${prompt}"`);

  try {
    const imageUrls = [];
    // Loop to generate multiple images one by one
    for (let i = 0; i < numberOfImagesToGenerate; i++) {
      try {
        console.log(`Generating image ${i + 1}/${numberOfImagesToGenerate} for prompt: "${prompt}"`);
        const imageResponse = await openai.images.generate({
          model: "dall-e-3", // Use DALL-E 3 for high quality
          // You can modify the prompt slightly for each image if you want more variation
          prompt: `${prompt}. This is design variation ${i + 1} of ${numberOfImagesToGenerate}.`,
          n: 1, // <--- Crucially, 'n' MUST be 1 for DALL-E 3
          size: "1024x1024", // Standard size for DALL-E 3
          response_format: "url", // Request the image as a URL
        });
        imageUrls.push(imageResponse.data[0].url);
      } catch (innerError) {
        console.error(`Error generating image ${i + 1}:`, innerError.message);
        // If one image fails, you might push null or a placeholder URL to the array
        // to indicate failure for that specific image, without stopping the whole process.
        imageUrls.push(null);
        // Optionally, you could send a partial response or specific error if needed
      }
    }

    // Send the array of all generated image URLs (or nulls for failed ones) back to the frontend
    console.log('Successfully generated images. URLs:', imageUrls);
    res.json({ imageUrls });

  } catch (error) {
    console.error('Error during poster generation:', error);

    // Provide more specific error messages based on the OpenAI API response
    if (error.response) {
      // If the error has a response object (e.g., from OpenAI API)
      console.error('OpenAI API Error Status:', error.response.status);
      console.error('OpenAI API Error Data:', error.response.data);
      res.status(error.response.status).json({
        error: error.response.data.error ? error.response.data.error.message : 'An error occurred with the OpenAI API.',
        details: error.response.data, // Include full details for debugging
      });
    } else {
      // Handle network errors or other unexpected issues
      res.status(500).json({
        error: 'Failed to connect to the OpenAI API or an unexpected error occurred.',
        details: error.message,
      });
    }
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log('Make sure your OpenAI API key is correctly set in backend/.env');
});