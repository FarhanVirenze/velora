const fs = require('fs');
const path = require('path');

const dir = 'c:\\laragon\\www\\Microservice E-Commerce\\frontend-web\\src';

const files = [
  'components/ProductCard.tsx',
  'app/register/page.tsx',
  'app/profile/page.tsx',
  'app/profile/address/page.tsx',
  'app/products/[id]/page.tsx',
  'app/page.tsx',
  'app/orders/page.tsx',
  'app/login/page.tsx',
  'app/checkout/page.tsx',
  'app/cart/page.tsx'
];

const fullPageLoader = `<div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>`;

const buttonLoader = `<div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>`;

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace full page spinners
    content = content.replace(/<div className="w-(8|12) h-(8|12)[^>]*animate-spin[^>]*><\/div>/g, fullPageLoader);
    
    // Replace button spinners
    content = content.replace(/<span className="w-[^>]*animate-spin[^>]*><\/span>/g, buttonLoader);
    
    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  }
});
