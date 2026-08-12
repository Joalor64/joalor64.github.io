(async function loadFeaturedProjects() {
    const gallery = document.getElementById("featuredProjects");
    if (!gallery) return;

    const response = await fetch("data/featured.json");
    const data = await response.json();

    data.featured.forEach(project => {
        gallery.insertAdjacentHTML("beforeend", `
            <div class="game-gallery-item">
                <div class="game-thumbnail">
                    <div class="img"
                        style="background-image:url('${project.img}')">
                    </div>
                </div>

                <h3 class="game-name">${project.name}</h3>

                <p class="featured-desc">
                    ${project.desc}
                </p>
                
                <div class="game-links">
                    ${project.links.modio
                ? `<div class="link-icon" id="modio"
                            onclick="window.open('${project.links.modio}')"></div>`
                : ""
            }

                    ${project.links.itch
                ? `<div class="link-icon" id="itch"
                            onclick="window.open('${project.links.itch}')"></div>`
                : ""
            }
                    
                    ${project.links.github
                ? `<div class="link-icon" id="github"
                            onclick="window.open('${project.links.github}')"></div>`
                : ""
            }

                    ${project.links.gamebanana
                ? `<div class="link-icon" id="gamebanana"
                            onclick="window.open('${project.links.gamebanana}')"></div>`
                : ""
            }
                </div>
            </div>
        `);
    });
})();

(async function loadLatestNews() {
    const newsContainer = document.querySelector('.home-news-container');
    if (!newsContainer) return;

    try {
        const response = await fetch("./data/news.json");
        const data = await response.json();

        if (!data.news || data.news.length === 0) return;

        const latestGroup = data.news[0];
        if (!latestGroup.posts || latestGroup.posts.length === 0) return;
        const post = latestGroup.posts[0];

        const dateGroup = document.createElement('div');
        dateGroup.classList.add('news-date-group');

        const dateHeader = document.createElement('div');
        dateHeader.classList.add('news-date-header');
        dateHeader.textContent = latestGroup.date;
        dateGroup.appendChild(dateHeader);

        const newsPost = document.createElement('div');
        newsPost.classList.add('news-post');

        if (post.img) {
            const newsImg = document.createElement('div');
            newsImg.classList.add('news-img');
            const img = document.createElement('img');
            img.src = post.img;
            newsImg.appendChild(img);
            newsPost.appendChild(newsImg);
        }

        const newsContent = document.createElement('div');
        newsContent.classList.add('news-content');

        const newsTitle = document.createElement('div');
        newsTitle.classList.add('news-title');
        newsTitle.textContent = post.title;
        newsContent.appendChild(newsTitle);

        const newsInfo = document.createElement('div');
        newsInfo.classList.add('news-info');
        newsInfo.innerHTML = post.info;
        newsContent.appendChild(newsInfo);

        if (post.buttons && post.buttons.length > 0) {
            const newsButtons = document.createElement('div');
            newsButtons.classList.add('news-buttons');
            post.buttons.forEach(button => {
                const a = document.createElement('a');
                a.href = button.link;
                a.textContent = button.text;
                a.target = "_blank";
                newsButtons.appendChild(a);
            });
            newsContent.appendChild(newsButtons);
        }

        newsPost.appendChild(newsContent);
        dateGroup.appendChild(newsPost);

        newsContainer.appendChild(dateGroup);

    } catch (error) {
        console.error('Error loading latest news data:', error);
    }
})();