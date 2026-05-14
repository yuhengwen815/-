// 菜单数据
const menuData = {
    food: [
        { id: 1, name: '奶茶', emoji: '\u{1F95B}', price: 15 },
        { id: 2, name: '咖啡', emoji: '☕', price: 20 },
        { id: 3, name: '面条', emoji: '\u{1F35C}', price: 25 },
        { id: 4, name: '披萨', emoji: '🍕', price: 45 },
        { id: 5, name: '炸鸡', emoji: '🍗', price: 30 },
        { id: 6, name: '冰淇淋', emoji: '🍦', price: 12 },
        { id: 7, name: '蛋糕', emoji: '🍰', price: 28 },
        { id: 8, name: '果汁', emoji: '🧃', price: 10 }
    ],
    game: [
        { id: 9, name: '游戏代练', emoji: '🎮', price: 50 },
        { id: 10, name: '组队开黑', emoji: '🎯', price: 30 },
        { id: 11, name: '游戏皮肤', emoji: '🦸', price: 88 },
        { id: 12, name: '游戏道具', emoji: '⚔️', price: 20 },
        { id: 13, name: '陪玩服务', emoji: '🎪', price: 60 },
        { id: 14, name: '游戏攻略', emoji: '📖', price: 15 }
    ],
    life: [
        { id: 15, name: '代购服务', emoji: '🛍️', price: 30 },
        { id: 16, name: '跑腿服务', emoji: '🏃', price: 25 },
        { id: 17, name: '叫醒服务', emoji: '⏰', price: 10 },
        { id: 18, name: '情感咨询', emoji: '💬', price: 50 },
        { id: 19, name: '拍照服务', emoji: '📸', price: 40 },
        { id: 20, name: '快递代取', emoji: '📦', price: 15 }
    ]
};

// 购物车
let cart = {};
let currentCategory = 'food';

// DOM元素
const menuContainer = document.getElementById('menu-container');
const cartContainer = document.getElementById('cart-container');
const totalPriceEl = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const orderSummary = document.getElementById('order-summary');
const confirmCheckout = document.getElementById('confirm-checkout');
const closeModal = document.getElementById('close-modal');
const navBtns = document.querySelectorAll('.nav-btn');

// 初始化
function init() {
    renderMenu(currentCategory);
    bindEvents();
}

// 渲染菜单
function renderMenu(category) {
    const items = menuData[category];
    menuContainer.innerHTML = items.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <div class="emoji">${item.emoji}</div>
            <div class="name">${item.name}</div>
            <div class="price">¥${item.price}</div>
            <div class="quantity-control">
                <button class="qty-btn minus" data-id="${item.id}">-</button>
                <span class="quantity" data-id="${item.id}">${cart[item.id] || 0}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
        </div>
    `).join('');
}

// 渲染购物车
function renderCart() {
    const cartItems = Object.entries(cart).filter(([id, qty]) => qty > 0);
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">购物车是空的</p>';
        checkoutBtn.disabled = true;
        updateTotal();
        return;
    }
    
    checkoutBtn.disabled = false;
    
    cartContainer.innerHTML = cartItems.map(([id, qty]) => {
        const item = findItemById(parseInt(id));
        const subtotal = item.price * qty;
        return `
            <div class="cart-item" data-id="${id}">
                <div class="item-info">
                    <div class="item-name">${item.emoji} ${item.name}</div>
                    <div class="item-price">¥${item.price} × ${qty}</div>
                </div>
                <div class="item-qty">
                    <button class="qty-btn minus-cart" data-id="${id}">-</button>
                    <span class="qty-number">${qty}</span>
                    <button class="qty-btn plus-cart" data-id="${id}">+</button>
                    <button class="remove-btn" data-id="${id}">✕</button>
                </div>
            </div>
        `;
    }).join('');
    
    updateTotal();
}

// 查找商品
function findItemById(id) {
    for (const category of Object.values(menuData)) {
        const item = category.find(item => item.id === id);
        if (item) return item;
    }
    return null;
}

// 更新总价
function updateTotal() {
    let total = 0;
    Object.entries(cart).forEach(([id, qty]) => {
        const item = findItemById(parseInt(id));
        if (item) total += item.price * qty;
    });
    totalPriceEl.textContent = `¥${total.toFixed(2)}`;
}

// 更新菜单数量显示
function updateMenuQuantity(id, qty) {
    const qtyEl = menuContainer.querySelector(`.quantity[data-id="${id}"]`);
    if (qtyEl) qtyEl.textContent = qty;
}

// 添加商品到购物车
function addToCart(id, change) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += change;
    if (cart[id] < 0) cart[id] = 0;
    updateMenuQuantity(id, cart[id]);
    renderCart();
}

// 购物车操作
function updateCartQty(id, change) {
    addToCart(parseInt(id), change);
}

// 从购物车移除
function removeFromCart(id) {
    const qty = cart[id] || 0;
    if (qty > 0) {
        addToCart(parseInt(id), -qty);
    }
}

// 绑定事件
function bindEvents() {
    // 分类导航
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderMenu(currentCategory);
        });
    });

    // 菜单数量控制（事件委托）
    menuContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('minus')) {
            const id = parseInt(target.dataset.id);
            addToCart(id, -1);
        } else if (target.classList.contains('plus')) {
            const id = parseInt(target.dataset.id);
            addToCart(id, 1);
        }
    });

    // 购物车操作（事件委托）
    cartContainer.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (target.classList.contains('minus-cart')) {
            updateCartQty(id, -1);
        } else if (target.classList.contains('plus-cart')) {
            updateCartQty(id, 1);
        } else if (target.classList.contains('remove-btn')) {
            removeFromCart(id);
        }
    });

    // 结算按钮
    checkoutBtn.addEventListener('click', showCheckoutModal);

    // 确认结算
    confirmCheckout.addEventListener('click', confirmOrder);

    // 关闭结算弹窗
    closeModal.addEventListener('click', hideCheckoutModal);
    
    // 点击结算弹窗背景关闭
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            hideCheckoutModal();
        }
    });
    
    // 关闭分享弹窗
    const closeShareBtn = document.getElementById('close-share');
    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', hideShareModal);
    }
    
    // 点击分享弹窗背景关闭
    const shareModal = document.getElementById('share-modal');
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                hideShareModal();
            }
        });
    }
}

// 显示结算弹窗
function showCheckoutModal() {
    const cartItems = Object.entries(cart).filter(([id, qty]) => qty > 0);
    let total = 0;
    
    orderSummary.innerHTML = cartItems.map(([id, qty]) => {
        const item = findItemById(parseInt(id));
        const subtotal = item.price * qty;
        total += subtotal;
        return `
            <div class="order-item">
                <span>${item.emoji} ${item.name} × ${qty}</span>
                <span>¥${subtotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    
    orderSummary.innerHTML += `
        <div class="order-total">
            <span>总计</span>
            <span>¥${total.toFixed(2)}</span>
        </div>
    `;
    
    checkoutModal.classList.add('show');
}

// 隐藏结算弹窗
function hideCheckoutModal() {
    checkoutModal.classList.remove('show');
}

// 确认订单
function confirmOrder() {
    hideCheckoutModal();
    showShareModal();
}

// 显示分享弹窗
function showShareModal() {
    const cartItems = Object.entries(cart).filter(([id, qty]) => qty > 0);
    let total = 0;
    let orderText = '🎉 好友点单 🎉\n\n';
    
    cartItems.forEach(([id, qty]) => {
        const item = findItemById(parseInt(id));
        const subtotal = item.price * qty;
        total += subtotal;
        orderText += `${item.emoji} ${item.name} × ${qty} = ¥${subtotal}\n`;
    });
    
    orderText += `\n💰 总计：¥${total.toFixed(2)}\n`;
    orderText += `\n请帮我准备这些，谢谢！😊`;
    
    // 生成订单链接（使用URL参数编码订单信息）
    const orderData = cartItems.map(([id, qty]) => `${id}:${qty}`).join(',');
    const shareUrl = `${window.location.origin}${window.location.pathname}?order=${encodeURIComponent(orderData)}`;
    
    // 更新弹窗内容
    const shareModal = document.getElementById('share-modal');
    const orderTextEl = document.getElementById('order-text');
    const copyBtn = document.getElementById('copy-order');
    const shareLinkEl = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link');
    
    orderTextEl.value = orderText;
    shareLinkEl.value = shareUrl;
    
    // 复制订单文本
    copyBtn.onclick = () => {
        orderTextEl.select();
        document.execCommand('copy');
        showToast('📋 订单文本已复制！可粘贴到微信/邮件');
    };
    
    // 复制分享链接
    copyLinkBtn.onclick = () => {
        shareLinkEl.select();
        document.execCommand('copy');
        showToast('🔗 分享链接已复制！可发送给好友');
    };
    
    shareModal.classList.add('show');
}

// 显示提示
function showToast(message) {
    const toast = document.getElementById('toast-message');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 从URL加载订单
function loadOrderFromURL() {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order');
    
    if (orderParam) {
        const items = orderParam.split(',');
        items.forEach(item => {
            const [id, qty] = item.split(':');
            if (id && qty) {
                cart[id] = parseInt(qty);
            }
        });
        renderCart();
        renderMenu(currentCategory);
        showToast('📦 已加载订单，请确认并分享给好友！');
    }
}

// 关闭分享弹窗
function hideShareModal() {
    const shareModal = document.getElementById('share-modal');
    shareModal.classList.remove('show');
    
    // 清空购物车
    cart = {};
    renderMenu(currentCategory);
    renderCart();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadOrderFromURL();
});