# Rentify Server

Backend API for the Rentify car rental platform.

## Tech Stack

- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication (jose-cjs)
- BetterAuth

## API Endpoints

| Method | Endpoint          | Description                    |
| ------ | ----------------- | ------------------------------ |
| GET    | /car              | Get all cars (search & filter) |
| POST   | /car              | Add a new car                  |
| GET    | /car/:id          | Get car details                |
| PATCH  | /car/:id          | Update car                     |
| DELETE | /car/:id          | Delete car                     |
| GET    | /car/user/:userId | Get user's cars                |
| POST   | /bookings         | Create booking                 |
| GET    | /bookings/:userId | Get user's bookings            |

## Live Server

🚀 [https://rentify-server-theta.vercel.app](https://rentify-server-theta.vercel.app)
