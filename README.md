# Interactive Natal Chart App

An interactive web application for generating and exploring astrological natal charts. This application allows users to input their birth data and view their personalized natal chart with planetary positions, aspects, and interpretations.

## Features

- Generate natal charts based on birth date, time, and location
- Interactive visualization of planetary positions and zodiac signs
- Display of aspects between planets
- Chart interpretation and analysis
- Current transit charts
- Save and load multiple birth profiles

## Technologies Used

- React.js for the frontend UI
- D3.js for chart visualization
- date-fns for date handling
- Vercel for deployment

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/natal-chart-app.git
   cd natal-chart-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```
npm run build
```

This will create an optimized build in the `build` directory.

## Deployment on Vercel

This application is configured for easy deployment on Vercel.

### Automatic Deployment

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Vercel will automatically detect the React application and deploy it

### Manual Deployment

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the application:
   ```
   vercel
   ```

## Troubleshooting Deployment Issues

If you encounter issues deploying to Vercel, try the following:

1. **Build Errors**: Check the build logs in Vercel for specific error messages.

2. **Environment Variables**: Make sure any required environment variables are set in the Vercel project settings.

3. **CI/CD Settings**: The project is configured with `CI=false` in the `.env` file to prevent the build from failing on warnings.

4. **Node.js Version**: Ensure Vercel is using Node.js v14 or higher. You can specify this in the `package.json` file under the `engines` field.

5. **Vercel Configuration**: The `vercel.json` file contains the necessary configuration for deployment. Make sure it's properly set up.

6. **Browser Compatibility**: The application uses modern JavaScript features. Make sure your target browsers are compatible.

## License

MIT

## Contact

For any questions or issues, please open an issue on GitHub or contact the maintainer. 