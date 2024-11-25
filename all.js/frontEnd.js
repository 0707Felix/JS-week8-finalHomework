
import {base_url,api_path} from './config.js';

    let productInform = [];
    //1.確定取得商品資訊.執行第2步驟。
    function getProduct(){
        axios.get(`${base_url}${api_path}/products`)
        .then(res =>{
            // console.log(res.data.products);
            productInform = res.data.products;
            renderProduct(productInform);
        }).catch(err =>{
            console.log(err);
        })   
    } 
    const productWrap = document.querySelector('.productWrap');
    
    //2.商品產品頁面渲染
    function renderProduct(list){
        let str ='';
        list.forEach(item =>{
            str += `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id= ${item.id}>加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">$${item.origin_price}</del>
            <p class="nowPrice">$${item.price}</p>
        </li>`
        })
        productWrap.innerHTML = str;
    }

    //3.網頁產品篩選，(1)監聽使用者選項 (2)從使用者選項中去比對總產品清單，挑出相同商品去呈現
    let productSelect = document.querySelector('.productSelect');
 
    function filterProduct(){
         //假設一個空陣列的變數來承接重複的內容(*注意result放在forEach函數外.否則迭代結果不會積累)
        let result = [] ;
        productInform.forEach(item =>{
            if(item.category === productSelect.value){
                result.push(item);
            }
            if(productSelect.value === '全部'){
                result.push(item);
            }
        })
        renderProduct(result);
    }

    productSelect.addEventListener('change',()=>{
        filterProduct();
    }) 
    
   //4.購物車畫面渲染
    let cartData = [];
    let cartTotal = 0;
    function getCart(){
        axios.get(`${base_url}${api_path}/carts`)
        .then(res =>{
            cartData = res.data.carts;
            cartTotal = res.data.finalTotal;
            renderCart();
        }).catch(err =>{    
            console.log(err);
        })   
    }

    const shoppingCartTableBody = document.querySelector('.shoppingCart-table tbody');
    const shoppingCartTableFoot = document.querySelector('.shoppingCart-table tfoot');
    function renderCart(){
        if(cartData.length === 0){
        shoppingCartTableBody.innerHTML ='目前購物車內沒有任何商品';  
        shoppingCartTableFoot.innerHTML = ''; 
        cartTotal = 0; // 當購物車為空時，總金額歸零
        return; 
    }    
        let str = '';
        let total = 0; // 初始化總金額
        cartData.forEach(item =>{
        const itemTotal = item.quantity * item.product.price; 
        total += itemTotal; // 累計到總金額    
        str += `<tr data-id="${item.id}">
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>${item.product.price}</td>
                    <td><button type="button" class="minusBtn">-</button>
                    ${item.quantity}
                    <button type="button" class="addBtn">+</button>
                    </td>
                    <td>NT$${itemTotal}</td>
                    <td>
                        <a href="#" class="material-icons clearBtn">
                            clear
                        </a>
                    </td>
                </tr>`
        });
            // 更新全域的 cartTotal 並更新 HTML
        cartTotal = total;
        shoppingCartTableBody.innerHTML = str;
        shoppingCartTableFoot.innerHTML = `<tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${cartTotal}</td>
                </tr>`; 
    }

    //5.加入購物車
    productWrap.addEventListener('click', (e) => {
        e.preventDefault();
        // 确保点击的是加入购物车的按钮
        if (e.target.classList.contains('addCardBtn')) {
            const productId = e.target.dataset.id;
            addrCart(productId);
        }
    });
    function addrCart(id) {
        // 检查购物车中是否已经包含该商品
        const existingItem = cartData.find(item => item.product.id === id);
    
        // 如果商品已在购物车中
        if (existingItem) {
            // 提醒用户商品已在购物车
            Swal.fire({
                icon: 'info',
                title: '商品已在購物車中',
                text: '該商品已經加入過購物車了。',
                confirmButtonText: '知道了'
            });
            return; // 不再继续执行后续添加购物车的操作
        }
    
        // 如果商品不在购物车中，执行加入购物车的操作
        const data = {
            "data": {
                "productId": id,
                "quantity": 1
            }
        };
    
        // 禁用按钮并更新显示
        const addButton = document.querySelector(`.addCardBtn[data-id='${id}']`);
        addButton.disabled = true;
        addButton.textContent = "已加入購物車";
    
        axios.post(`${base_url}${api_path}/carts`, data)
            .then(res => {
                console.log(res);
                cartData = res.data.carts;
                cartTotal = res.data.finalTotal;
                renderCart();  // 更新购物车显示
    
                // 显示成功提示
                Swal.fire({
                    icon: 'success',
                    title: '商品已成功加入購物車',
                    confirmButtonText: '繼續購物'
                });
    
                // 延迟恢复按钮
                setTimeout(() => {
                    addButton.disabled = false;
                    addButton.textContent = "加入購物車";
                }, 3000);
            })
            .catch(err => {
                console.log(err);
            });
    }
    //6.刪除購物車"所有"品項
        const delAllButton = document.querySelector('.discardAllBtn');
        function deleteAllCart() {
            Swal.fire({
                title: "您確定要刪除購物車內的商品嗎?",
                text: "商品刪除後，需重新加入!",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "是的, 確認刪除!"
            }).then((result) => {
                if (result.isConfirmed) {
                    // 用户确认后再执行清空购物车的逻辑
                    axios.delete(`${base_url}${api_path}/carts`)
                        .then((res) => {
                            console.log("All items deleted:", res);
                            cartData = []; // 更新购物车数据为空
                            renderCart(); // 重新渲染购物车
                            Swal.fire({
                                title: "已完成!",
                                text: "購物車已清空",
                                icon: "success"
                            });
                        })
                        .catch((err) => {
                            console.log("Failed to clear cart:", err);
                        });
                }
            });
        }
        delAllButton.addEventListener('click',(e)=>{
            e.preventDefault();
            deleteAllCart();
        }); 

        shoppingCartTableFoot.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('discardAllBtn')) {
                deleteAllCart();
            }
        });

     //7.刪除購物車"單一"品項
     function deleteOneCart(id){
         axios.delete(`${base_url}${api_path}/carts/${id}`).then(res =>{
             console.log(res);
             cartData = res.data.carts;
             renderCart();
         }).catch(err =>{    
            console.log(err);
        })   
     }

     shoppingCartTableBody.addEventListener('click',(e)=>{
         e.preventDefault();
         if(e.target.hasAttribute("data-id")){
            deleteOneCart(e.target.dataset.id)
         };
     });
     
    //8.編輯產品數量
    function updateCartNum(id,quantity){
        const data ={
            "data":{
                id,
                "quantity":quantity,
            }
        }
        axios.patch(`${base_url}${api_path}/carts`,data).then(res =>{
            console.log(res);
            cartData = res.data.carts;
            renderCart();
        }).catch(err =>{    
            console.log(err);
        })     
    } 

    shoppingCartTableBody.addEventListener('click',(e)=>{
       const id = e.target.closest('tr').getAttribute('data-id');
        e.preventDefault();
        if(e.target.classList.contains("clearBtn")){
           deleteOneCart(id)
        };
        if(e.target.classList.contains("addBtn")){
            let result ={};
            cartData.forEach(item =>{
                if(item.id === id){
                    result = item;
                }
            })
           let quantity = result.quantity + 1;
           updateCartNum(id,quantity);
         };
         if(e.target.classList.contains("minusBtn")){
            let result ={};
            cartData.forEach(item =>{
                if(item.id === id){
                    result = item;
                }
            })
           let quantity = result.quantity - 1;
           if (quantity < 1) return; 
           updateCartNum(id,quantity);
         };
        });
        
    //9.送出表單資料
    const orderInfoForm = document.querySelector('.orderInfo-form');
    function formCheck() {
        const constraints = {
            姓名: {
                presence: { message: "^必填" },
            },
            電話: {
                presence: { message: "^必填" },
            },
            Email: {
                presence: { message: "^必填" },
                email: { message: "^請輸入正確的信箱格式" },
            },
            寄送地址: {
                presence: { message: "^必填" },
            },
        };
        const error = validate(orderInfoForm, constraints);
        if (error) {
                alert('必填欄位請記得填寫！');
        }
        return error;
    }

    const orderInfoBtn = document.querySelector('.orderInfo-btn');
    function sendOrder() {
        if (cartData.length === 0) {
            alert("購物車目前無任何商品");
            return;
        }
        if (formCheck()) {
            return;
        }
    
        const customerName = document.querySelector("#customerName");
        const customerPhone = document.querySelector("#customerPhone");
        const customerEmail = document.querySelector("#customerEmail");
        const customerAddress = document.querySelector("#customerAddress");
        const tradeWay = document.querySelector("#tradeWay");
    
        const data = {
            data: {
                user: {
                    name: customerName.value.trim(),
                    tel: customerPhone.value.trim(),
                    email: customerEmail.value.trim(),
                    address: customerAddress.value.trim(),
                    payment: tradeWay.value,
                },
            },
        };
    
        axios.post(`${base_url}${api_path}/orders`, data)
            .then(res => {
                console.log(res);
                orderInfoForm.reset();
                confirmclearBtn(); // 訂單成功後清空購物車
            })
            .catch(err => {
                console.error(err.response);
            });
    }
    orderInfoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sendOrder(); // 如果表单验证通过，执行发送订单
    });
    
    //10.單獨刪除表單送出後清除購物車內的商品函數
    function confirmclearBtn() {
        axios.delete(`${base_url}${api_path}/carts`)
            .then((res) => {
                console.log("All items deleted:", res);
                cartData = []; // 更新購物車內數據
                renderCart(); // 重新渲染購物車
                Swal.fire({
                    title: "已完成!",
                    text: "訂單成立，感謝您的訂購！",
                    icon: "success"
                });
            })
            .catch((err) => {
                console.error("清空購物車失敗:", err);
                Swal.fire({
                    title: "錯誤!",
                    text: "清空購物車失敗，請稍後再試。",
                    icon: "error"
                });
            });
    }
    //初始化  備註:可能會有多個函式需要初始化，可寫在初始化函式中集中管理維護。
    function init(){
        getProduct();
        getCart();
    }
    init();

