curl -X POST "http://localhost:4000/universities/register" \
 -H "Content-Type: application/json" \
 -d '{
   "name": "Example University",
   "country": "Uganda",
   "districtCity": "Lira",
   "admin": {
     "username": "admin1",
     "firstName": "Admin",
     "secondName": "One",
     "email": "admin@example.edu",
     "phone": "+256700000000",
     "password": "StrongPass123!"
   }
 }'
