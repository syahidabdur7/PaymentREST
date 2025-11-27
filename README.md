# REST API - Simple Payment
Assignment API for Nutech Recruitment Process

---

## Fitur 
- **Registrasi**
- **Login**
- **Top Up**
- **Transaction**

---

## Teknologi
- Node.js + Express.js
- Sequelize ORM
- PostgreSQL
- JWT (JSON Web Token)
---

## Endpoint

| Method | Endpoint             | Deskripsi                  |
|--------|----------------------|----------------------------|
| POST   | `/api/register`       | Registrasi user baru         |
| POST   | `/api/login`          | Login user                   |
| GET    | `/api/balance`        | Cek saldo user               |
| POST   | `/api/topup`          | Top up saldo                 |
| POST   | `/api/transaction`    | Lakukan transaksi pembayaran |
| GET    | `/api/getUsers`       | Ambil semua user             |
| GET    | `/api/transactionList`| Ambil semua transaksi        |
| PUT    | `/api/updateUser`     | Update user                  |
| DELETE | `/api/deleteUser`     | Hapus user berdasarkan       |  
|        |

---

## Contoh Request

### Register
{
    "username": "armantsakur",
    "email":    "atsakur@gmail.com",
    "password": "dagz123"  
}

### Login
Header:
{Authentication: Bearer (JWT Token)}
Body: {
    "username": "armantsakur",
    "email":    "atsakur@gmail.com",
    "password": "dagz123"  
}

## User List
{}

## Check Balance
Header:
{Authentication: Bearer (JWT Token)}
Body: {}

## Transaksi
Header:
{Authentication: Bearer (JWT Token)}
Body: {
    "amount": 50000,
    "service": "Top Up Game"
}

## Top Up
Header:
{Authentication: Bearer (JWT Token)}
{
    "amount": 300000
}

## List Transaksi
{}

## Update User
{
    "id":   6,
    "username": "Osman Urtugrul"
}

## Delete User
{
    "id": 5
}
