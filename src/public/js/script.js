let navbar = document.querySelector('.header2 .navbar2');

document.querySelector('#menu-btn').onclick = () => {
    navbar.classList.add('active');
}
document.querySelector('#nav-close').onclick = () => {
    navbar.classList.remove('active');
}

var swiper = new Swiper(".product-slider", {
    loop: true,
    grabCursor: true,
    spaceBetween: 20,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        640: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 3,
        },
        1024: {
            slidesPerView: 4,
        },
    },
});

const categoryTitle = document.querySelectorAll('.category-title');
const AllCategoryPost = document.querySelectorAll('.all');

for(let i=0; i<categoryTitle.length; i++){
    categoryTitle[i].addEventListener('click',filterPosts.bind(this, categoryTitle[i]))
}

function filterPosts(item){
    changeActivePosition(item);
    for(let i=0; i<AllCategoryPost.length; i++){
        if(AllCategoryPost[i].classList.contains(item.attributes.id.value)){
            AllCategoryPost[i].style.display = "block";

        }else{
            AllCategoryPost[i].style.display = "none";
        }
    }
}

function changeActivePosition(activeItem){
    for(let i=0; i<categoryTitle.length; i++){
        categoryTitle[i].classList.remove('active');
    }
    activeItem.classList.add('active');
}
