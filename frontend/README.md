# Project Frontend

This project integrates with the Google Generative AI API and such in order to run the project successfully, you need to configure a `.env` file with the appropriate environment variables.

## Setup

### Setting Up the `.env` File

1. Create a `.env` file in the frontend-directory of the project.

2. Add the following line to the `.env` file:

   ```env
   VITE_GOOGLE_API_KEY=your-google-api-key
   ```

   However, replace `your-google-api-key` part with your actual API key.

## Accessing the Environment Variable

In the project files, the API key is accessed using the `import.meta.env` object as shown below:

```javascript
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
```

## Running the Project

1. Make sure you are operating inside frontend-directory!

1. Install the required dependencies:

   ```bash
   npm install
   ```

2. Run the project:

   ```bash
   npm run dev
   ```

3. The application will now have access to the Google Generative AI API using the API key specified in the `.env` file.

## General Notes

- Do not share your `.env` file or API key publicly.
- If the `.env` file is not working, ensure that your project supports environment variables. For Vite-based projects, environment variables prefixed with `VITE_` are automatically available via `import.meta.env`.
- If the API key is not being recognized, ensure you have restarted the development server after modifying the `.env` file.
- Check for typos in the `.env` file and ensure there are no extra spaces around the `=` symbol.