import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

console.log('\nAll environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.startsWith('MONGODB') || key.startsWith('JWT') || key === 'PORT' || key === 'NODE_ENV') {
    console.log(`${key}:`, process.env[key] ? 'Set' : 'Not set');
  }
});
