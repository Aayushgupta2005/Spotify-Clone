async function getSongs(folder){
    let data = await fetch(`http://192.168.29.146:3000/songs/${folder}`)
    let response=await data.text()
    let div=document.createElement("div")
    div.innerHTML=response
    let a=div.getElementsByTagName("a")
    let links=[]
    for(let i=0;i<a.length;i++){
        const ele=a[i];
        if(ele.href.endsWith(".mp3")){
            links.push(ele.href)
        }
    }
    return links;
}
async function getImage(folder){
    let data = await fetch(`http://192.168.29.146:3000/songs/${folder}`)
    let response=await data.text()
    let div=document.createElement("div")
    div.innerHTML=response
    let a=div.getElementsByTagName("a")
    let img_links=[]
    for(let i=0;i<a.length;i++){
        const ele=a[i];
        if(ele.href.endsWith(".jpg") || ele.href.endsWith(".jpeg")){
            img_links.push(ele.href)
        }
    }
    return img_links;
}
async function getFolders(){
    let data = await fetch("http://192.168.29.146:3000/songs/")
    let response = await data.text()
    let div=document.createElement("div")
    div.innerHTML=response
    let a=div.getElementsByTagName("a")
    let folders=[]
    Array.from(a).forEach((ele)=>{
        if((ele.innerHTML.slice(0,-1)) !== ".."){
            folders.push(ele.innerHTML.slice(0,-1));
        };
    });
    return folders;
}
function formatTime(seconds) {
    if(isNaN(seconds)  || seconds<0){
        return "00:00";
    }
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}
let curr_song=new Audio()
let curr_playlist;
let curr_songs_links=[];
let curr_folder_songs_name=[]
function playSound(track){
    curr_song.src=track;
    curr_song.play();
    document.querySelector("#play").src="assets/pausebtn.svg"
}
function update_songs(){
    curr_folder_songs_name=[]
    for(let i=0;i<curr_songs_links.length;i++){
        let temp_folder_name=`/${curr_playlist.split(" ")[0]}%20${curr_playlist.split(" ")[1]}/`;
        curr_folder_songs_name.push(((((curr_songs_links[i].split(temp_folder_name))[1]).split("-"))[0]).replaceAll("%20"," ").replaceAll("_"," "))
    }
    if(curr_folder_songs_name.length>0){
        document.querySelector("#songname").innerHTML=curr_folder_songs_name[0];
        curr_song.src=curr_songs_links[0]
    }
    let ul_ele=document.querySelector(".allsongcards")
    ul_ele.innerHTML="";
    for(let i=0;i<curr_folder_songs_name.length;i++){
        ul_ele.innerHTML=ul_ele.innerHTML+`<li class="songcard">
            <div class="flex" style="gap: 10px;width: 70%;align-items: center;">
                <img class="invert" src="assets/music.svg" alt="">
                <div>
                <div class="song-link" hidden>${curr_songs_links[i]}</div>
                <div class="song-name">${curr_folder_songs_name[i]}</div>
                </div>
            </div>
            <div>
                <div class="flex" style="align-items: center;">Play <img class="invert" src="assets/playbut.svg" alt=""></div>
            </div>
            </li>`
    }
    Array.from(document.querySelector(".allsongcards").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",()=>{
            let song_to_play=e.querySelector(".song-link").innerHTML
            document.querySelector("#songname").innerHTML=e.querySelector(".song-name").innerHTML
            playSound(song_to_play)
        })
    })
}
async function main(){
    let folders_name= await getFolders();
    if(folders_name.length>0){
        curr_playlist=folders_name[0];
        await (async () => {
            curr_songs_links=await getSongs(folders_name[0]);
        })();
        update_songs();
    }
    folders_name.forEach(async (ele)=>{
        let newCardDiv=document.createElement("div")
        newCardDiv.setAttribute("class","card");
        let imageLink=await getImage(ele)
        console.log(imageLink)
        newCardDiv.innerHTML=`<svg class="play_button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" color="#000000" fill="#1fdf64"><circle cx="25" cy="25" r="20" stroke="green" stroke-width="0" /><path d="M20 17.5385V30.4615C20 31.9231 20 32.6538 20.4558 32.9615C20.9115 33.2692 21.5348 32.9295 22.7815 32.25L32.3189 26.7885C33.8191 25.9712 34.5692 25.5625 34.5692 24.9135C34.5692 24.2644 33.8191 23.8558 32.3189 23.0385L22.7815 17.577C21.5348 16.8974 20.9115 16.5577 20.4558 16.8654C20 17.1731 20 17.9038 20 19.3654V17.5385Z" fill="currentColor" /></svg><img class="cardImage" src=${imageLink[0]} alt=""><h3 class="cardHeading">${ele}</h3>`
        document.querySelector(".cards_container").append(newCardDiv);
        newCardDiv.querySelector(".play_button").addEventListener("click",async ()=>{
            document.querySelector(".durationbarcircle").style.left="0%"
            document.querySelector("#play").src="assets/playbut.svg"
            let links=[];
            await (async () => {
                links=await getSongs(ele);
                console.log(links)
            })();
            curr_songs_links=links;
            curr_playlist=ele;
            update_songs();
        })
    });
    document.querySelector("#play").addEventListener("click",()=>{
        if(curr_song.paused){
            curr_song.play();
            document.querySelector("#play").src="assets/pausebtn.svg"
        }else{
            curr_song.pause();
            document.querySelector("#play").src="assets/playbut.svg"
        }
    })
    document.querySelector("#previous").addEventListener("click",()=>{
        let ind=curr_songs_links.indexOf(curr_song.src);
        let newind=ind-1;
        if(newind<0){
            newind=curr_songs_links.length - 1;
        }
        document.querySelector("#songname").innerHTML=curr_folder_songs_name[newind]
        playSound(curr_songs_links[newind])
    })
    document.querySelector("#next").addEventListener("click",()=>{
        let ind=curr_songs_links.indexOf(curr_song.src);
        let newind=(ind+1)%(curr_songs_links.length)
        document.querySelector("#songname").innerHTML=curr_folder_songs_name[newind]
        playSound(curr_songs_links[newind])
    })
    curr_song.addEventListener("timeupdate",e=>{
        document.querySelector("#durationinminutes").innerHTML=`${formatTime(curr_song.currentTime)}/${formatTime(curr_song.duration)}`;
        document.querySelector(".durationbarcircle").style.left=(curr_song.currentTime/curr_song.duration)*100 + "%"
    })
    document.querySelector(".durationbar").addEventListener("click",e=>{
        document.querySelector(".durationbarcircle").style.left=(e.offsetX/e.target.getBoundingClientRect().width)*100 + "%"
        document.querySelector("#durationinminutes").innerHTML=`${formatTime((e.offsetX/e.target.getBoundingClientRect().width)*curr_song.duration)}/${formatTime(curr_song.duration)}`;
        curr_song.currentTime=((e.offsetX/e.target.getBoundingClientRect().width)*curr_song.duration)
    })
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left=1+"%"
        document.querySelector(".left").style.backgroundColor="black";
    })
    document.querySelector(".close-btn").addEventListener("click",()=>{
        document.querySelector(".left").style.left=-150+"%"
    }) 
    volrangebtn.addEventListener("change",(e)=>{
        curr_song.volume=e.target.value/100
    })
}
main();
