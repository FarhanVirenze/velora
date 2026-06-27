const http = require('http');

// Konfigurasi Load Test
const CONCURRENCY = 100; // Jumlah user/koneksi bersamaan
const DURATION_SECONDS = 15; // Lama waktu pengetesan
const API_URL = 'http://localhost:8000';
const MOCK_TOKEN = 'mock-jwt-token-ey1234567890'; // Token bypass jika API mendukungnya, atau Anda bisa men-generate token valid.

let successCount = 0;
let failCount = 0;
let startTime = Date.now();

// Utility untuk request HTTP
function request(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer dummy_token_${Math.random()}` // Gunakan random token agar dianggap user berbeda (jika support), atau 'Bearer dummy_token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 500, data: e.message });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Simulasi 1 flow user: Tambah ke Keranjang -> Checkout
async function simulateUserFlow() {
  // 1. Add to cart
  const addRes = await request('POST', '/api/cart/items', { productId: 'p1', quantity: 1 });
  
  if (addRes.status !== 200 && addRes.status !== 201) {
    failCount++;
    return;
  }

  // 2. Checkout Order
  const checkoutRes = await request('POST', '/api/orders', {});
  
  if (checkoutRes.status === 201 || checkoutRes.status === 200) {
    successCount++;
  } else {
    failCount++;
  }
}

async function runLoadTest() {
  console.log(`🚀 Memulai Load Test Checkout dengan ${CONCURRENCY} user bersamaan selama ${DURATION_SECONDS} detik...`);
  
  const endAt = Date.now() + (DURATION_SECONDS * 1000);
  
  // Fungsi rekursif untuk terus-menerus menjalankan flow selama waktu belum habis
  async function worker() {
    while (Date.now() < endAt) {
      await simulateUserFlow();
    }
  }

  // Jalankan sejumlah worker sesuai CONCURRENCY
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const duration = (Date.now() - startTime) / 1000;
  const totalRequests = successCount + failCount;
  const rps = (totalRequests / duration).toFixed(2);

  console.log('\n=======================================');
  console.log('📊 HASIL LOAD TEST (Checkout Flow)');
  console.log('=======================================');
  console.log(`Waktu berjalan     : ${duration} detik`);
  console.log(`Total Transaksi    : ${totalRequests}`);
  console.log(`Transaksi Sukses   : ✅ ${successCount}`);
  console.log(`Transaksi Gagal    : ❌ ${failCount}`);
  console.log(`Rata-rata          : ${rps} transaksi / detik (TPS)`);
  console.log('=======================================');
  console.log('💡 Note: Jika banyak yang gagal (5xx/4xx), berarti CPU/Database atau RabbitMQ Anda mulai kewalahan.');
}

runLoadTest();
