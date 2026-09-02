// متغيرات عامة
let currentUser = null;
let userInvestments = [];

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    
    // التعامل مع نموذج تسجيل الدخول
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // التعامل مع نموذج إنشاء الحساب
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// تبديل بين التبويبات
function switchTab(tab) {
    // إخفاء جميع النماذج
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // إزالة الفئة النشطة من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار النموذج المختار
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tab === 'register') {
        document.getElementById('registerForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

// معالج تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // التحقق من وجود البيانات في localStorage
    const users = JSON.parse(localStorage.getItem('pixelUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        userInvestments = user.investments || [];
        showDashboard();
    } else {
        alert('البريد أو كلمة المرور غير صحيحة');
    }
}

// معالج إنشاء الحساب
function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    
    // التحقق من تطابق كلمات المرور
    if (password !== password2) {
        alert('كلمات المرور غير متطابقة');
        return;
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    // الحصول على قائمة المستخدمين
    let users = JSON.parse(localStorage.getItem('pixelUsers')) || [];
    
    // التحقق من عدم وجود بريد مكرر
    if (users.find(u => u.email === email)) {
        alert('هذا البريد مسجل بالفعل');
        return;
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: Date.now(),
        email: email,
        password: password,
        balance: 1000,
        investments: [],
        createdAt: new Date().toISOString()
    };
    
    // إضافة المستخدم الجديد
    users.push(newUser);
    localStorage.setItem('pixelUsers', JSON.stringify(users));
    
    // تسجيل دخول تلقائي
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    userInvestments = [];
    
    alert('تم إنشاء الحساب بنجاح! مرحباً بك في Pixel');
    showDashboard();
}

// عرض لوحة التحكم
function showDashboard() {
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('dashboardSection').classList.add('active');
    
    // تحديث معلومات المستخدم
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('walletBalance').textContent = currentUser.balance.toFixed(2);
    
    // تحديث قائمة الاستثمارات
    updateInvestmentsList();
}

// الاشتراك في خطة
function subscribe(amount) {
    if (currentUser.balance < amount) {
        alert('رصيدك غير كافي لهذه الخطة');
        return;
    }
    
    // تقليل الرصيد
    currentUser.balance -= amount;
    
    // إضافة الاستثمار
    const investment = {
        id: Date.now(),
        amount: amount,
        date: new Date().toLocaleDateString('ar-SA'),
        status: 'نشط',
        returnPercentage: getReturnPercentage(amount)
    };
    
    if (!userInvestments) {
        userInvestments = [];
    }
    
    userInvestments.push(investment);
    currentUser.investments = userInvestments;
    
    // حفظ البيانات
    saveUserData();
    
    // تحديث الواجهة
    document.getElementById('walletBalance').textContent = currentUser.balance.toFixed(2);
    updateInvestmentsList();
    
    alert(`تم الاشتراك بنجاح في الخطة! الاستثمار: $${amount}`);
}

// حساب نسبة العائد بناءً على المبلغ
function getReturnPercentage(amount) {
    if (amount === 20) return '5%';
    if (amount === 100) return '12%';
    if (amount === 500) return '18%';
    if (amount === 1000) return '25%';
    return '5%';
}

// تحديث قائمة الاستثمارات
function updateInvestmentsList() {
    const investmentsList = document.getElementById('investmentsList');
    
    if (!userInvestments || userInvestments.length === 0) {
        investmentsList.innerHTML = '<p class="empty-state">لا توجد استثمارات حالياً</p>';
        return;
    }
    
    let html = '';
    userInvestments.forEach(investment => {
        html += `
            <div class="investment-item">
                <div>
                    <h4>استثمار بقيمة $${investment.amount}</h4>
                    <p>تاريخ الاستثمار: ${investment.date}</p>
                    <p>الحالة: <span style="color: #00ff88;">${investment.status}</span></p>
                </div>
                <div style="text-align: right;">
                    <div class="amount">+${investment.returnPercentage}</div>
                    <p style="color: #00ff88; margin-top: 5px;">عائد شهري</p>
                </div>
            </div>
        `;
    });
    
    investmentsList.innerHTML = html;
}

// حفظ بيانات المستخدم
function saveUserData() {
    let users = JSON.parse(localStorage.getItem('pixelUsers')) || [];
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem('pixelUsers', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// تحميل بيانات المستخدم
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userInvestments = currentUser.investments || [];
        showDashboard();
    } else {
        // إنشاء بيانات تجريبية
        createDemoData();
    }
}

// إنشاء بيانات تجريبية
function createDemoData() {
    // لا نقوم بإنشاء بيانات تجريبية، نترك الصفحة للتسجيل الجديد
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    userInvestments = [];
    localStorage.removeItem('currentUser');
    
    // إعادة تعيين النموذج
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    
    // العودة إلى صفحة التسجيل
    document.getElementById('dashboardSection').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
    
    // العودة لتبويب تسجيل الدخول
    switchTab('login');
}

// محاكاة تحديث الرصيد تلقائياً كل دقيقة
setInterval(function() {
    if (currentUser && userInvestments.length > 0) {
        // حساب العائد الصغير كل دقيقة (محاكاة)
        let totalReturn = 0;
        userInvestments.forEach(inv => {
            const percentage = parseFloat(inv.returnPercentage) / 100;
            totalReturn += inv.amount * percentage / (30 * 24 * 60); // عائد شهري مقسوم على دقائق الشهر
        });
        
        if (totalReturn > 0) {
            currentUser.balance += totalReturn;
            document.getElementById('walletBalance').textContent = currentUser.balance.toFixed(2);
            saveUserData();
        }
    }
}, 60000); // كل دقيقة
