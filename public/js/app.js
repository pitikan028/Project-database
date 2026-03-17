// Shopping Cart Logic
let cart = [];

function addToCart(productName) {
    // ค้นหาสินค้าในตะกร้า
    let existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // เพิ่มสินค้าใหม่
        let price = 0;
        if (productName === 'CR-V 2024') price = 299000;
        else if (productName === 'Fortuner 2024') price = 329000;
        else if (productName === 'CB500X') price = 189000;
        else if (productName === 'Vios 2024') price = 199000;
        
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`เพิ่ม ${productName} ลงตะกร้าแล้ว!`);
}

function updateCart() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('cart-count').textContent = cartCount;
    document.getElementById('total-price').textContent = '฿' + totalPrice.toLocaleString('th-TH');
    
    // แสดงรายการสินค้า
    const cartItemsHTML = cart.map((item, index) => `
        <div class="p-4 border-b flex justify-between items-center">
            <div>
                <h4 class="font-bold">${item.name}</h4>
                <p class="text-gray-600 text-sm">฿${item.price.toLocaleString('th-TH')} x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${index})" class="text-pink-500 hover:text-pink-400 transition">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const cartItemsDiv = document.getElementById('cart-items');
    if (cartItemsHTML) {
        cartItemsDiv.innerHTML = cartItemsHTML;
    } else {
        cartItemsDiv.innerHTML = '<p class="text-gray-500 text-center">ไม่มีสินค้าในตะกร้า</p>';
    }
}

function removeFromCart(index) {
    if (confirm('ลบสินค้านี้ออกจากตะกร้า?')) {
        cart.splice(index, 1);
        updateCart();
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    sidebar.classList.toggle('translate-x-full');
    overlay.classList.toggle('opacity-0');
    overlay.classList.toggle('pointer-events-none');
}

// ปิด cart เมื่อคลิก overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('cart-overlay');
    overlay.addEventListener('click', toggleCart);
});

function showNotification(message) {
    // สร้าง notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // ลบ notification หลังจาก 2 วินาที
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// API Mock - ดึงข้อมูลจาก backend (ถ้าจำเป็น)
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        console.log('Products:', data);
    } catch (error) {
        console.log('API not available yet');
    }
}

// เมื่อ page โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
});
