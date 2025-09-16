// ==UserScript==
// @name         My OSINT Training
// @namespace    http://tampermonkey.net/
// @version      1.0.5
// @description  Tamper before bookmarklets
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @noframes
// ==/UserScript==

const TM_JSONreveal = (function(){var scripts=document.querySelectorAll('script');var jsonStrings=[];for(var i=0;i<scripts.length;i++){var script=scripts[i];if(script.type==='application/json'||script.innerText.trim().startsWith('{')||script.innerText.trim().startsWith('[')){try{jsonStrings.push(JSON.stringify(JSON.parse(script.innerText),null,2))}catch(e){console.error('Failed to parse JSON:',script.innerText)}}}if(jsonStrings.length){var jsonWindow=window.open('','JsonPopup','width=800,height=800,scrollbars=1,resizable=1');var pre=jsonWindow.document.createElement('pre');pre.style.width='800';pre.style.margin='auto';pre.style.whiteSpace='pre-wrap';pre.textContent=jsonStrings.join('\n\n');jsonWindow.document.body.innerHTML='';jsonWindow.document.body.appendChild(pre)}else{alert('No JSON found.')}});

const TM_domainSearch = (function(){var DOMAIN=prompt('Enter DOMAIN- no www: ');var sites=[`https://whoisology.com/${DOMAIN}`,`https://builtwith.com/${DOMAIN}`,`https://dnslytics.com/domain/${DOMAIN}`,`https://host.io/${DOMAIN}`,`https://whois.domaintools.com/${DOMAIN}`,`https://viewdns.info/whois/?domain=${DOMAIN}`,`https://viewdns.info/reverseip/?host=${DOMAIN}&t=1`,`https://viewdns.info/iphistory/?domain=${DOMAIN}`];if(DOMAIN&&DOMAIN.trim()!==``){for(let site of sites){GM_openInTab(site,`_blank`)}}});

const TM_emailSearch = (function(){var EMAIL=prompt('Enter EMAIL: ');let sites=[`https://thatsthem.com/email/${EMAIL}`,`https://www.google.com/search?q='${EMAIL}'`,`https://emailrep.io/query/${EMAIL}`];if(EMAIL&&EMAIL.trim()!==''){for(let site of sites){GM_openInTab(site,'_blank')}}});

const TM_bandlab = (function(){const url=window.location.href;const username=url.split('/').pop();if(!username){alert('Invalid BandLab profile URL.');return}fetch(`https://www.bandlab.com/api/v1.3/users/${username}`).then(response=>{if(!response.ok){throw new Error('Network response was not ok')}return response.json()}).then(data=>{const modal=document.createElement('div');modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='white';modal.style.padding='20px';modal.style.boxShadow='0 0 10px rgba(0, 0, 0, 0.5)';modal.style.zIndex='1000';let linksContent='';if(data.links&&Object.keys(data.links).length>0){linksContent='<h3>Links:</h3><ul>';for(const[key,value]of Object.entries(data.links)){linksContent+=`<li><strong>${key.charAt(0).toUpperCase()+key.slice(1)}:</strong> <a href='${value}' target='_blank'>${value}</a></li>`}linksContent+='</ul>'}const content=`<h2>User Information</h2><p><strong>Username:</strong> ${username}</p><p><strong>Display Name:</strong> ${data.name}</p><p><strong>ID:</strong> ${data.id}</p><p><strong>Created On:</strong> ${new Date(data.createdOn).toLocaleString()}</p><p><strong>Modified On:</strong> ${new Date(data.modifiedOn).toLocaleString()}</p>${linksContent}<button id='closeModal'>Close</button>`;modal.innerHTML=content;document.body.appendChild(modal);document.getElementById('closeModal').addEventListener('click',function(){document.body.removeChild(modal)})}).catch(error=>{console.error('Error fetching user data:',error);alert('Failed to fetch user data. Please try again later.')})});

const TM_blueskyIDlookup = (function(){try{var userId=prompt('Enter the Bsky User ID:');if(userId&&userId.trim()!==''){var url='https://bsky.app/profile/did:plc:'+userId.trim();window.open(url,'_blank');}else{alert('No User ID provided!');}}catch(e){alert('Error processing request: '+e.message);}});

const TM_blueskyIDreveal = (async function(){try{let response=await fetch(location.href);let html=await response.text();var idRegex=/did:plc:([a-zA-Z0-9]+)/g;var idMatch=idRegex.exec(html);var displayNameRegex=/bsky_display_name.>([^<]+)<\/p>/;var handleRegex=/bsky_handle.>([^<]+)<\/p>/;var displayNameMatch=html.match(displayNameRegex);var handleMatch=html.match(handleRegex);var userId=idMatch&&idMatch[1]?idMatch[1]:'Not Found';var displayName=displayNameMatch&&displayNameMatch[1]?displayNameMatch[1]:'Not Found';var handle=handleMatch&&handleMatch[1]?handleMatch[1]:'Not Found';var modal=document.createElement('div');modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#222';modal.style.color='#fff';modal.style.padding='20px';modal.style.border='2px solid #fff';modal.style.borderRadius='8px';modal.style.zIndex='9999';modal.style.textAlign='center';modal.innerHTML=`<p style='font-family: Arial, sans-serif; margin-bottom: 10px;'><strong>User ID:</strong> ${userId}</p><p style='font-family: Arial, sans-serif; margin-bottom: 10px;'><strong>Display Name:</strong> ${displayName}</p><p style='font-family: Arial, sans-serif; margin-bottom: 10px;'><strong>Handle:</strong> ${handle}</p><button style='padding: 5px 10px; background-color: #fff; color: #222; border: none; border-radius: 5px; cursor: pointer;' onclick='document.body.removeChild(this.parentNode)'>Close</button>`;document.body.appendChild(modal)}catch(e){alert('Error processing request: '+e.message)}});

const TM_cashapp = (function(){function e(){var e=document.getElementsByTagName('script');for(var t=0;t<e.length;t++){var n=e[t].textContent||e[t].innerText||'';var r=n.match(/var\s+profile\s*=\s*({[\s\S]*?});/);if(r){try{return JSON.parse(r[1])}catch(e){console.error('Error parsing profile JSON:',e)}}}return null}function t(e){if(!e){alert('Profile data not found!');return}var t=document.createElement('div');t.style.position='fixed';t.style.top='0';t.style.left='0';t.style.width='100%';t.style.height='100%';t.style.background='rgba(0,0,0,.7)';t.style.zIndex='999999';t.style.display='flex';t.style.alignItems='flex-start';t.style.justifyContent='flex-start';t.addEventListener('click',function(e){if(e.target===t){document.body.removeChild(t)}});var n=document.createElement('div');n.style.background='#fff';n.style.color='#000';n.style.padding='20px';n.style.borderRadius='8px';n.style.boxShadow='0 0 10px rgba(0,0,0,.3)';n.style.maxWidth='80%';n.style.maxHeight='70%';n.style.overflow='auto';n.style.margin='24px';n.addEventListener('click',function(e){e.stopPropagation()});var r=document.createElement('div');r.innerHTML='<h2 style=\'color:#000;margin:0 0 10px 0;\'> '+(e.display_name||'')+'</h2>'+'<p><strong>Formatted Cashtag:</strong> '+(e.formatted_cashtag||'')+'</p>'+'<p><strong>Account Verified?</strong> '+(e.is_verified_account?'Yes':'No')+'</p>'+'<p><strong>Rate Plan:</strong> '+(e.rate_plan||'')+'</p>'+'<p><strong>Country Code:</strong> '+(e.country_code||'')+'</p>';var a=document.createElement('div');a.style.marginTop='10px';function o(t){if(!t)return null;try{return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}catch(e){return null}}var i=(e.avatar&&e.avatar.image_url)||'';var l=o(i);var s=[];if(l){s.push('img[src='+i+']','img[srcset*='+i+']')}var q=String.fromCharCode(34);s.push('img[class*='+q+'avatar'+q+' i]','img[alt*='+q+'avatar'+q+' i]','img[class*='+q+'profile'+q+' i]','img[alt*='+q+'profile'+q+' i]','img[class*='+q+'user'+q+' i]','img[alt*='+q+'user'+q+' i]');var d=null;for(var c=0;c<s.length&&!d;c++){try{d=document.querySelector(s[c])}catch(e){}}var p=document.createElement('div');p.style.marginTop='10px';var u=document.createElement('a');u.href='void(0)';u.style.display='inline-block';u.style.textDecoration='underline';u.style.cursor='pointer';u.style.fontWeight='600';if(d&&d.naturalWidth>0){u.textContent='✅ Profile Image found. Click here to reveal';u.addEventListener('click',function(f){f.preventDefault();var m=d.cloneNode(true);m.removeAttribute('srcset');m.style.maxWidth='50%';m.style.height='auto';m.style.display='block';p.innerHTML='';p.appendChild(m)})}else if(i){u.textContent='✅ Profile Image found. Click here to reveal';u.addEventListener('click',function(f){f.preventDefault();window.open(i,'_blank')})}else{u.textContent='No profile image available';u.style.textDecoration='none';u.style.cursor='default';u.style.fontWeight='400'}p.appendChild(u);n.appendChild(r);n.appendChild(a);n.appendChild(p);t.appendChild(n);document.body.appendChild(t)}var n=e();t(n)});

const TM_facebookID = (function(){const findProfileInfo=()=>{const profileIdRegex=/"userID":"(\d+)"/;const profileIdMatch=document.documentElement.outerHTML.match(profileIdRegex);const profileId=profileIdMatch?profileIdMatch[1]:'Not present in page';const displayRegex=/data':\{'name':'([^']+)'/;const displayMatch=document.documentElement.innerHTML.match(displayRegex);const displayName=displayMatch?displayMatch[1]:'Not present in page';return{profileId:profileId,displayName:displayName}};const profileInfo=findProfileInfo();if(profileInfo){const infoHtml='Display Name: '+profileInfo.displayName+'<br>'+'Facebook ID: '+profileInfo.profileId+'<br>'+'Current URL: '+document.URL;const modal=document.createElement('div');modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#333';modal.style.color='#fff';modal.style.padding='20px';modal.style.border='2px solid #fff';modal.style.borderRadius='10px';modal.style.zIndex='10000';modal.style.maxWidth='80%';modal.style.textAlign='left';const closeBtn=document.createElement('button');closeBtn.innerText='Close';closeBtn.style.marginTop='10px';closeBtn.style.padding='5px 10px';closeBtn.style.backgroundColor='#fff';closeBtn.style.color='#333';closeBtn.style.border='none';closeBtn.style.cursor='pointer';closeBtn.style.borderRadius='5px';closeBtn.onclick=()=>document.body.removeChild(modal);modal.innerHTML=`<div style='font-family: Arial, sans-serif; white-space: pre-wrap;'>${infoHtml}</div>`;modal.appendChild(closeBtn);document.body.appendChild(modal)}else{alert('Profile ID, display name, or username not found!')}});

const TM_facebookMarket = (function(){try{const regex=/userID":"(\d+)"/;const match=document.documentElement.outerHTML.match(regex);if(match&&match[1]){const profileId=match[1];const url=`https://www.facebook.com/marketplace/?seller_profile=${profileId}`;window.open(url,'_blank')}else{alert('Facebook ID not found!')}}catch(e){alert('Error processing request: '+e.message)}});

const TM_facebookProfileImage = (function(){try{const findProfilePicLargeUri=obj=>{if(obj&&typeof obj==='object'){for(const key in obj){if(key==='profilePicLarge'&&obj[key].uri){return obj[key].uri}const result=findProfilePicLargeUri(obj[key]);if(result)return result}}return null};const scripts=document.querySelectorAll('script');let profilePicUrl=null;scripts.forEach(script=>{const content=script.textContent;try{const jsonStart=content.indexOf('{');const jsonEnd=content.lastIndexOf('}')+1;if(jsonStart!==-1&&jsonEnd!==-1){const json=JSON.parse(content.substring(jsonStart,jsonEnd));const result=findProfilePicLargeUri(json);if(result)profilePicUrl=result}}catch(e){return}});if(profilePicUrl){const decodedUrl=profilePicUrl.replace(/\\\\u0026/g,'&');window.open(decodedUrl,'_blank')}else{alert('Profile picture URL not found!')}}catch(e){alert('Error processing request: '+e.message)}});

const TM_instagramUauthUser = (function(){function extractMetaTags(){const metaTags=document.querySelectorAll('meta[property=\'og:title\'], meta[property=\'og:image\'], meta[name=\'description\'], meta[name=\'twitter:description\'], meta[name=\'twitter:title\']');const overlay=document.createElement('div');overlay.style.position='fixed';overlay.style.top='0';overlay.style.left='0';overlay.style.width='100%';overlay.style.height='100%';overlay.style.background='rgba(0, 0, 0, 0.7)';overlay.style.color='#fff';overlay.style.fontFamily='Arial, sans-serif';overlay.style.fontSize='16px';overlay.style.padding='20px';overlay.style.boxSizing='border-box';overlay.style.zIndex='9999';overlay.style.overflow='auto';const closeButton=document.createElement('button');closeButton.textContent='Close';closeButton.style.position='fixed';closeButton.style.top='20px';closeButton.style.right='20px';closeButton.style.padding='10px';closeButton.style.cursor='pointer';closeButton.style.background='#fff';closeButton.style.border='none';closeButton.style.borderRadius='5px';closeButton.style.fontFamily='Arial, sans-serif';closeButton.style.fontSize='16px';closeButton.style.zIndex='10000';closeButton.addEventListener('click',function(){document.body.removeChild(overlay)});overlay.appendChild(closeButton);const metaInfo=document.createElement('div');metaInfo.style.marginBottom='20px';metaInfo.innerHTML='<h2>Meta Tags:</h2>';metaTags.forEach(tag=>{const tagName=tag.getAttribute('property')||tag.getAttribute('name');const tagContent=tag.getAttribute('content');if(tagName==='og:image'){metaInfo.innerHTML+=`<p><strong>${tagName}:</strong> <img src='${tagContent}' alt='Image'></p>`}else{metaInfo.innerHTML+=`<p><strong>${tagName}:</strong> ${tagContent}</p>`}});overlay.appendChild(metaInfo);document.body.appendChild(overlay)}extractMetaTags()});

const TM_instagramPhotoDisplay = (function(){var url=window.location.href;if(location.href.match(/instagram.com.*\/p\//)){let newUrl=`${document.location.origin}/p/${document.location.pathname.split('/p/').at(-1)}media?size=l`;window.open(newUrl,'_blank')}else{alert('This is not an Instagram post URL.')}});

const TM_instagramUserID = (function(){var modal=document.createElement('div');modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#333';modal.style.color='white';modal.style.zIndex='10000';modal.style.fontFamily='Arial, sans-serif';modal.style.fontSize='20px';modal.style.padding='20px';modal.style.boxSizing='border-box';modal.style.borderRadius='8px';var content=document.createElement('div');content.style.textAlign='left';var url=window.location.href;let userStr=document.querySelector('meta[name=\'description\']').getAttribute('content').match(/ - (.*?) on Instagram:/)[1];let[,displayName,username]=userStr.match(/(.*?) ?\(?@(.+?)\)?$/);let[,instagramId]=document.body.innerHTML.match(/profilePage_(.*?)"/);displayName=displayName||'Not Found';username=username||'Not Found';instagramId=instagramId||'Not Found';content.innerHTML=`<p style='font-size: 24px;font-weight: bold;text-align: center;'>Instagram User Profile Details</h2><p>Username: ${username}</p><p>Display Name: ${displayName}</p><p>Instagram ID: ${instagramId}</p><p>Current URL: ${url}</p>`;modal.appendChild(content);document.body.appendChild(modal);modal.onclick=function(){document.body.removeChild(modal)}});

const TM_instagramProfilePicture = (function(){try{function findProfilePicUrl(){var imgTags=document.querySelectorAll('img');for(var img of imgTags){if(img.alt&&img.alt.includes('\'s profile picture')){return img.src}}return null}var profilePicUrl=findProfilePicUrl();if(profilePicUrl){var newWindow=window.open();newWindow.document.write(`<html><head><title>Profile Image</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background-color:#f0f0f0;}img{max-width:100%;max-height:100%;border:1px solid #ccc;box-shadow:0 4px 8px rgba(0,0,0,0.1);}.message{position:fixed;top:10px;left:50%;transform:translateX(-50%);background-color:white;border:1px solid black;padding:10px;z-index:10000;}</style></head><body><img src='${profilePicUrl}' alt='Profile Image' /><div class='message'>Right click on the image to save it</div></body></html>`);newWindow.document.close()}else{alert('Profile image URL not found!')}}catch(e){alert('Error processing request: '+e.message)}});

const TM_instagramSaveSingleImage = (function(){var newUrl=window.location.href+'media/?size=l';var newWindow=window.open();newWindow.document.write(`<html><head><title>Image Viewer</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background-color:#f0f0f0;}img{max-width:100%;max-height:100%;border:1px solid #ccc;box-shadow:0 4px 8px rgba(0,0,0,0.1);}.message{position:fixed;top:10px;left:50%;transform:translateX(-50%);background-color:white;border:1px solid black;padding:10px;z-index:10000;}</style></head><body><img src='${newUrl}' alt='Image' /><div class='message'>Right click on the image to save it</div></body></html>`);newWindow.document.close()});

const TM_snapchatUserID = (function(){function findProfileInfo(){if('18'==document.documentElement.innerHTML.match(/"pageType":(\d\d)/)[1]){var e=document.documentElement.innerHTML.match(/"dateCreated":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/);var o=document.documentElement.innerHTML.match(/"dateModified":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/);var t=e?e[1]:'[Not Present]';var n=o?o[1]:'[Not Present]';var r=document.getElementById('__NEXT_DATA__');var l=JSON.parse(r.text).props.pageProps.userProfile.publicProfileInfo;return{createdDate:t,modifiedDate:n,username:l.username,displayName:l.title?l.title:'[Not Present]',bio:l.bio?l.bio:'[Not Present]',location:l.address?l.address:'[Not Present]',websiteUrl:l.websiteUrl?l.websiteUrl:'[Not Present]'}}return alert('Sorry. This Snapchat user has no public profile.')}var profileInfo=findProfileInfo();if(profileInfo){var infoHtml='<strong>Username:</strong> @'+profileInfo.username+'<br><strong>Display Name:</strong> '+profileInfo.displayName+'<br><strong>Location:</strong> '+profileInfo.location+'<br><strong>Bio:</strong> '+profileInfo.bio+'<br><strong>Website:</strong> '+profileInfo.websiteUrl+'<br><strong>Created Timestamp:</strong> '+profileInfo.createdDate+'<br><strong>Modified Timestamp:</strong> '+profileInfo.modifiedDate+'<br><strong>Current URL:</strong> '+document.URL;let modal=document.createElement('div');modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#333';modal.style.color='#fff';modal.style.padding='20px';modal.style.border='2px solid #fff';modal.style.borderRadius='10px';modal.style.zIndex='10000';modal.style.maxWidth='80%';modal.style.textAlign='left';var closeBtn=document.createElement('button');closeBtn.innerText='Close';closeBtn.style.marginTop='10px';closeBtn.style.padding='5px 10px';closeBtn.style.backgroundColor='#fff';closeBtn.style.color='#333';closeBtn.style.border='none';closeBtn.style.cursor='pointer';closeBtn.style.borderRadius='5px';closeBtn.onclick=function(){document.body.removeChild(modal)};modal.innerHTML='<div style=\'font-family: Arial, sans-serif; white-space: pre-wrap;\'>'+infoHtml+'</div>';modal.appendChild(closeBtn);document.body.appendChild(modal)}});

const TM_smuleUserID = (function(){function getUsernameFromURL(){const path=window.location.pathname;return path.split('/').pop()}function showProfileModal(data){const modal=document.createElement('div');modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='rgba(0,0,0,0.8)';modal.style.color='white';modal.style.padding='20px';modal.style.borderRadius='10px';modal.style.zIndex='9999';modal.style.maxWidth='400px';modal.style.width='90%';const closeBtn=document.createElement('button');closeBtn.innerText='Close';closeBtn.style.position='absolute';closeBtn.style.top='10px';closeBtn.style.right='10px';closeBtn.onclick=()=>document.body.removeChild(modal);const content=document.createElement('div');content.innerHTML=`<h2>Profile Details</h2><p><strong>Current URL:</strong> ${window.location.href}</p><p><strong>Account ID:</strong> ${data.account_id}</p><p><strong>Username:</strong> ${data.handle}</p><p><strong>Display Name:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Location:</strong> ${data.location||'Not specified'}</p><p><strong>Verified:</strong> ${data.is_verified?`%E2%9C%85 ${data.verified_type}`:'%E2%9D%8C'}</p><p><strong>Installed Apps:</strong> ${data.installed_apps||'None'}</p>`;modal.appendChild(closeBtn);modal.appendChild(content);document.body.appendChild(modal)}function fetchSmuleProfile(){const username=getUsernameFromURL();fetch(`https://www.smule.com/api/profile/?handle=${username}`).then(response=>response.json()).then(data=>{showProfileModal(data)}).catch(error=>{alert('Error fetching profile: '+error)})}fetchSmuleProfile()});

const TM_telegramReveal = (function(){var a=document.getElementsByClassName('tgme_page_description')[0];alert(a.innerText)});

const TM_thatsthemDeblur = (function() {document.body.innerHTML = document.body.innerHTML.replace(/class="blur"/g, '');});

const TM_threadsFromInstagram = (function(){var url=window.location.href;if(url.includes('instagram.com/')){var username=url.split('instagram.com/')[1].split('/')[0];var newUrl='https://threads.net/@'+username;window.open(newUrl,'_blank')}else{alert('This is not an Instagram page.')}});

const TM_threadsUserID = (function(){const pageSource=document.documentElement.outerHTML;try{if(window.trustedTypes&&window.trustedTypes.createPolicy){window.trustedTypes.createPolicy('default',{createHTML:(string,sink)=>string})}}catch{};const decodeUnicode=str=>{return str.replace(/\\u[\dA-Fa-f]{4}/g,match=>{return String.fromCharCode(parseInt(match.replace(/\\u/,''),16))}).replace(/\\n/g,'<br>')};const formatBios=bios=>{return bios.map(bio=>`<div style='white-space: pre-wrap; text-align: left;'>${bio}</div>`).join('')};const extractValues=(regex,source)=>{const matches=[];let match;while((match=regex.exec(source))!==null){matches.push(decodeUnicode(match[1]))}return matches};const regexDisplayName=/"full_name":"([^"]+)"/g;const regexThreadsId=/"pk":"(\d+)"/g;const regexBio=/"biography":"([^"]+)"/g;const regexUsername=/"username":"([^"]+)"/g;const displayNames=extractValues(regexDisplayName,pageSource);const threadsIds=extractValues(regexThreadsId,pageSource);const bios=extractValues(regexBio,pageSource);const users=extractValues(regexUsername,pageSource);var modal=document.createElement('div');modal.style.position='absolute';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#333';modal.style.color='#fff';modal.style.padding='10px';modal.style.border='2px solid #fff';modal.style.borderRadius='10px';modal.style.zIndex='10000';modal.style.maxWidth='80%';modal.style.textAlign='left';'use strict';modal.innerHTML=window.trustedTypes.defaultPolicy.createHTML=`<div style='color:white; font-family: Arial, sans-serif; white-space: pre-wrap;'><p style='font-size:18px;color:white;text-align:center;'>Threads User Data</p><strong>Username:</strong> ${users[1]||'Not found'}<br><strong>Display Name:</strong> ${displayNames[0]||'Not found'}<strong><br>Threads ID:</strong> ${threadsIds[0]||'Not found'}<br><strong>Current URL:</strong> ${document.URL}<br><strong>Bio/Signature is below and may be multiple lines</strong><p>${formatBios(bios)||'Not found'}</p></div>`;var closeBtn=document.createElement('button');closeBtn.innerText='Close';closeBtn.style.marginTop='5px';closeBtn.style.padding='5px 10px';closeBtn.style.backgroundColor='#fff';closeBtn.style.color='#333';closeBtn.style.border='none';closeBtn.style.cursor='pointer';closeBtn.style.borderRadius='5px';closeBtn.onclick=function(){document.body.removeChild(modal)};modal.appendChild(closeBtn);document.body.appendChild(modal)});

const TM_tiktokUserID = (function(){function formatEpochTimestamp(epochTimestamp){const date=new Date(epochTimestamp*1e3);const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0');const hours=String(date.getHours()).padStart(2,'0');const minutes=String(date.getMinutes()).padStart(2,'0');const seconds=String(date.getSeconds()).padStart(2,'0');return`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`}var scriptElement=document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');var jsonData=JSON.parse(scriptElement.text);var userInfo=jsonData.__DEFAULT_SCOPE__&&jsonData.__DEFAULT_SCOPE__['webapp.user-detail']&&jsonData.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo&&jsonData.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.user;var uniqueId=userInfo.uniqueId;var nickname=userInfo.nickname;var id=userInfo.id;var avatarLarger=userInfo.avatarLarger;var createdTimestamp=userInfo.createTime;var formattedCreateDate=formatEpochTimestamp(createdTimestamp);var nickModTime=userInfo.nickNameModifyTime;var formattedNickMod=formatEpochTimestamp(nickModTime);var sig=userInfo.signature;var modal=document.createElement('div');var infoHtml=`<h2>TikTok User Data</h2><br>Username: ${uniqueId}<br>Display Name: ${nickname}<br>TikTok ID: ${id}<br>Created On: ${formattedCreateDate}<br>Nickname Changed: ${formattedNickMod}<br>Bio/Signature: ${sig}<br>Current URL: ${document.URL}`;modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#333';modal.style.color='#fff';modal.style.padding='20px';modal.style.border='2px solid #fff';modal.style.borderRadius='10px';modal.style.zIndex='10000';modal.style.maxWidth='80%';modal.style.textAlign='left';modal.innerHTML=`<div style='font-family: Arial, sans-serif; white-space: pre-wrap;'>${infoHtml}</div>`;var closeBtn=document.createElement('button');closeBtn.innerText='Close';closeBtn.style.marginTop='10px';closeBtn.style.padding='5px 10px';closeBtn.style.backgroundColor='#fff';closeBtn.style.color='#333';closeBtn.style.border='none';closeBtn.style.cursor='pointer';closeBtn.style.borderRadius='5px';closeBtn.onclick=function(){document.body.removeChild(modal)};modal.appendChild(closeBtn);document.body.appendChild(modal)});

const TM_tiktokURLDecode = (function(){function extractUnixTimestamp(vidId){const asBinary=BigInt(vidId).toString(2);const first31Chars=asBinary.slice(0,31);const timestamp=parseInt(first31Chars,2);return timestamp}function formatDate(timestamp){const date=new Date(timestamp*1e3);return date.toUTCString()}const url=window.location.href;const vidIdMatch=url.match(/\/(\d+)$/);if(vidIdMatch){const vidId=vidIdMatch[1];const timestamp=extractUnixTimestamp(vidId);const humanReadableDate=formatDate(timestamp);alert(`Extracted Unix Timestamp: ${timestamp}\nHuman Readable Date: ${humanReadableDate}`)}else{alert('Invalid URL. Please make sure it is a TikTok URL with a large number at the end.')}});

const TM_tiktokUserVideo = (function(){try{var scriptContent=document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__').text;var jsonData=JSON.parse(scriptContent);var defaultScope=jsonData?.__DEFAULT_SCOPE__;var userDetails=defaultScope?.['webapp.user-detail'];var videoDetails=defaultScope?.['webapp.video-detail'];var newWindow=window.open('','','width=600,height=400');newWindow.document.write(`<html><head><title>Extracted Data</title></head><body><h2>User Details</h2><pre>${JSON.stringify(userDetails,null,2)}</pre><h2>Video Details</h2><pre>${JSON.stringify(videoDetails,null,2)}</pre></body></html>`);newWindow.document.close()}catch(e){alert(`An error occurred: ${e.message}`)}});

const TM_USnames = (function(){var FIRSTNAME=prompt('Enter FIRSTNAME: ');var LASTNAME=prompt('Enter LASTNAME: ');var STATE=prompt('Enter STATE: ');let sites=[`https://www.truepeoplesearch.com/results?name=${FIRSTNAME} ${LASTNAME}&citystatezip=${STATE}`,`https://www.fastpeoplesearch.com/name/${FIRSTNAME}-${LASTNAME}_${STATE}`,`https://www.familytreenow.com/search/genealogy/results?first=${FIRSTNAME}&last=${LASTNAME}&citystatezip=${STATE}`,`https://www.searchpeoplefree.com/find/${FIRSTNAME}-${LASTNAME}/${STATE}`,`https://www.spokeo.com/${FIRSTNAME}-${LASTNAME}/${STATE}`,`https://www.whitepages.com/name/${FIRSTNAME}-${LASTNAME}/${STATE}`,`https://thatsthem.com/name/${FIRSTNAME}-${LASTNAME}/${STATE}`,`https://www.cyberbackgroundchecks.com/people/${FIRSTNAME}-${LASTNAME}/${STATE}`];if(FIRSTNAME&&FIRSTNAME.trim()!==''){for(let site of sites){GM_openInTab(site,`_blank`)}}});

const TM_USStatePhones = (function(){var AREACODE=prompt('Enter 3 DIGIT AREACODE ONLY: ');var PREFIX=prompt('Enter 3 DIGIT PREFIX ONLY: ');var LAST4=prompt('Enter LAST4 ONLY: ');const sites=[`https://www.truepeoplesearch.com/results?phoneno=(${AREACODE})${PREFIX}-${LAST4}`,`https://www.fastpeoplesearch.com/${AREACODE}-${PREFIX}-${LAST4}`,`https://nuwber.com/search/phone?phone=${AREACODE}${PREFIX}${LAST4}`,`https://www.whoseno.com/US/${AREACODE}${PREFIX}${LAST4}`,`https://www.peoplesearchnow.com/phone/${AREACODE}-${PREFIX}-${LAST4}`,`https://www.revealname.com/${AREACODE}-${PREFIX}-${LAST4}`,`https://www.searchpeoplefree.com/phone-lookup/${AREACODE}-${PREFIX}-${LAST4}`,`https://sync.me/search/?number=1${AREACODE}${PREFIX}${LAST4}`,`https://thatsthem.com/phone/${AREACODE}-${PREFIX}-${LAST4}`,`https://www.advancedbackgroundchecks.com/${AREACODE}-${PREFIX}-${LAST4}`,`https://www.usphonebook.com/${AREACODE}-${PREFIX}-${LAST4}`,`https://www.cyberbackgroundchecks.com/phone/${AREACODE}-${PREFIX}-${LAST4}`];if(AREACODE&&AREACODE.trim()!==''){for(let site of sites){GM_openInTab(site,`_blank`)}}});

const TM_venmo = (function(){var scriptElement=document.getElementById('__NEXT_DATA__');var jsonData=JSON.parse(scriptElement.text);var userInfo=jsonData.props.pageProps.user;var uniqueId=userInfo.username;var nickname=userInfo.displayName;var id=userInfo.id;var avatarPic=userInfo.profilePictureUrl;var modal=document.createElement('div');const infoHtml=`<h2>Venmo User Data</h2><br>Username: ${uniqueId}<br>Display Name: ${nickname}<br>Venmo ID: ${id}<br>Larger Avatar Image: <a href='${avatarPic}' target='_blank'>Click here</a><br>Current URL: ${document.URL}`;modal.style.position='fixed';modal.style.top='50%';modal.style.left='50%';modal.style.transform='translate(-50%, -50%)';modal.style.backgroundColor='#333';modal.style.color='#fff';modal.style.padding='20px';modal.style.border='2px solid #fff';modal.style.borderRadius='10px';modal.style.zIndex='10000';modal.style.maxWidth='80%';modal.style.textAlign='left';modal.innerHTML=`<div style='font-family: Arial, sans-serif; white-space: pre-wrap;'>${infoHtml}</div>`;var closeBtn=document.createElement('button');closeBtn.innerText='Close';closeBtn.style.marginTop='10px';closeBtn.style.padding='5px 10px';closeBtn.style.backgroundColor='#fff';closeBtn.style.color='#333';closeBtn.style.border='none';closeBtn.style.cursor='pointer';closeBtn.style.borderRadius='5px';closeBtn.onclick=function(){document.body.removeChild(modal)};modal.appendChild(closeBtn);document.body.appendChild(modal)});

const TM_xProfileBannerImage = (function(){const banners=document.querySelectorAll('img[src*=\'pbs.twimg.com/profile_banners\']');if(banners.length===0){alert('No X.com banner image found on this page.');return}const url=banners[0].src;const match=url.match(/\/(\d{10})(?=\/)/);let message='Date not found in X.com banner URL.';if(match){const epoch=parseInt(match[1],10);const date=new Date(epoch*1e3);message='X.com Banner Photo Created on:\n'+date.toUTCString()}const modal=document.createElement('div');modal.style.position='fixed';modal.style.top='0';modal.style.left='0';modal.style.width='100%';modal.style.height='100%';modal.style.backgroundColor='rgba(0,0,0,0.85)';modal.style.display='flex';modal.style.alignItems='center';modal.style.justifyContent='center';modal.style.zIndex='99999';const content=document.createElement('div');content.style.backgroundColor='#333';content.style.color='#fff';content.style.padding='20px 30px';content.style.borderRadius='10px';content.style.fontSize='18px';content.style.textAlign='left';content.style.whiteSpace='pre-line';content.textContent=message;modal.appendChild(content);modal.addEventListener('click',()=>document.body.removeChild(modal));document.body.appendChild(modal)});

const TM_xUserID = (()=>{try{const q=(s,r=document)=>r.querySelector(s);const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));const t=s=>typeof s==='string'?s.trim():'';const url=q('meta[property=\'og:url\']')?.content||location.href;const u=new URL(url);const parts=u.pathname.split('/').filter(Boolean);const handleFromURL=parts[0]||'';const USERNAME='@'+handleFromURL;const spans=qa('div[data-testid=\'UserName\'] span, div[data-testid=\'User-Name\'] span');const displayName=spans.map(s=>t(s.textContent)).find(x=>x&&!x.startsWith('@'))||'';const findId=()=>{let m;m=document.documentElement.innerHTML.match(/\/profile_images\/(\d+)\//);if(m)return m[1];m=document.documentElement.innerHTML.match(/\/profile_banners\/(\d+)\//);if(m)return m[1];for(const s of qa('script')){const x=s.textContent||'';m=x.match(/"rest_id":"(\d+)"/)||x.match(/"user_id":"(\d+)"/)||x.match(/"identifier":"(\d+)"/)||x.match(/"id_str":"(\d+)"/);if(m)return m[1]}return''};const identifier=findId();const findCreateISO=()=>{for(const s of qa('script')){const x=s.textContent||'';let m=x.match(/"dateCreated":'([^"]+)'/)||x.match(/"created_at":"([^"]+)"/)||x.match(/"createdAt":"([^"]+)"/);if(m){const d=new Date(m[1]);if(!isNaN(d))return d.toISOString()}}const joined=q('[data-testid=\'UserJoinDate\'] span')?.textContent||'';const jm=joined.match(/Joined\s+([A-Za-z]+)\s+(\d{4})/);if(jm){const d=new Date(`${jm[1]} 1, ${jm[2]} 00:00:00Z`);if(!isNaN(d))return d.toISOString()}return''};const createdISO=findCreateISO();const bannerImg=q('img[src*=\'pbs.twimg.com/profile_banners/\']')?.src||'';const decodeSnowflakeMs=id=>{try{const EPOCH=1288834974657n;return Number((BigInt(id)>>22n)+EPOCH)}catch{return NaN}};const parseBannerUpload=src=>{try{if(!src)return'';const clean=src.split('?')[0];const m=clean.match(/\/profile_banners\/\d+\/(\d+)/);if(!m)return'';const token=m[1];let ms=NaN;if(/^\d{19,}$/.test(token)){ms=decodeSnowflakeMs(token)}else if(/^\d{13}$/.test(token)){ms=parseInt(token,10)}else if(/^\d{10}$/.test(token)){ms=parseInt(token,10)*1e3}if(!isNaN(ms)){const d=new Date(ms);if(!isNaN(d))return d.toISOString()}return'(unknown)'}catch{return'(unknown)'}};const bannUp=parseBannerUpload(bannerImg);let profileImg=q('img[src*=\'pbs.twimg.com/profile_images/\']')?.src||q('meta[property=\'og:image\']')?.content||q('img[alt*=\'profile picture\']')?.src||'';const profileURL='https://x.com/'+handleFromURL;const out=[`Identifier: ${identifier||'(unknown)'}`,`Profile URL: ${profileURL}`,`Username: ${USERNAME||'(unknown)'}`,`Handle: ${displayName||'(unknown)'}`,`Create Date: ${createdISO||'(unknown)'}`,`Banner Image: ${bannerImg||'(not found)'}`,`Banner Upload Date: ${bannUp||'(unknown)'}`].join('\n');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(out).catch(()=>{})}const id='__x_prof_overlay__';document.getElementById(id)?.remove();const box=document.createElement('div');box.id=id;box.style.cssText=`position:fixed;z-index:2147483647;top:12px;right:12px;max-width:600px;background:#333;color:#fff;padding:12px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);font:14px/1.4 system-ui,Segoe UI,Roboto,Helvetica,Arial`;const imgHTML=profileImg?`<img src='${profileImg}' alt='Avatar' style='width:72px;height:72px;border-radius:50%;object-fit:cover;margin-right:10px;border:2px solid rgba(255,255,255,.2)'>`:`<div style='width:72px;height:72px;border-radius:50%;background:#333;margin-right:10px;display:flex;align-items:center;justify-content:center;color:#aaa'>N/A</div>`;box.innerHTML=`<div style='display:flex;align-items:center'>${imgHTML}<div style='min-width:0'><div style='font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'>${displayName||'(unknown)'} <span style='opacity:.8'>@${handleFromURL||''}</span></div></div></div><div style='margin-top:8px;opacity:.9'><div><strong>Identifier:</strong> ${identifier||'(unknown)'}</div><div><strong>Profile URL:</strong> ${profileURL}</div><div><strong>Username:</strong> @${handleFromURL||'(unknown)'}</div><div><strong>Handle:</strong> ${displayName||'(unknown)'}</div><div><strong>Create Date:</strong> ${createdISO||'(unknown)'}</div><div><strong>Banner Image:</strong> ${bannerImg||'(not found)'}</div><div><strong>Banner Upload Date:</strong> ${bannUp||'(unknown)'}</div><div style='display:flex;gap:8px;margin-top:10px'><button id='__x_copy_btn__' style='cursor:pointer;border:0;border-radius:8px;padding:6px 10px;background:#0f62fe;color:#fff'>Copy</button><button id='__x_close_btn__' style='cursor:pointer;border:0;border-radius:8px;padding:6px 10px;background:#444;color:#fff'>Close</button></div></div>`;document.body.appendChild(box);document.getElementById('__x_copy_btn__')?.addEventListener('click',()=>{navigator.clipboard?.writeText(out)});document.getElementById('__x_close_btn__')?.addEventListener('click',()=>{box.remove()})}catch(e){alert('Error: '+e)}});

const bookmarkletsJSON = [
  {
    title: "JSON Revealer Bookmarklet",
    js: TM_JSONreveal,
    domain: "*",
  },
  {
    title: "Domain Search Bookmarklet",
    js: TM_domainSearch,
    domain: "*",
  },
  {
    title: "Email Search Bookmarklet",
    js: TM_emailSearch,
    domain: "*",
  },
  {
    title: "BandLab User ID Bookmarklet",
    js: TM_bandlab,
    domain: "bandlab.com",
  },
  {
    title: "Bluesky ID to Profile Bookmarklet",
    js: TM_blueskyIDlookup,
    domain: "bsky.app",
  },
  {
    title: "Bluesky ID Revealer Bookmarklet",
    js: TM_blueskyIDreveal,
    domain: "bsky.app",
  },
  {
    title: "Cash.app Profile Bookmarklet",
    js: TM_cashapp,
    domain: "cash.app",
  },
  {
    title: "Facebook User ID Bookmarklet",
    js: TM_facebookID,
    domain: "facebook.com",
  },
  {
    title: "Facebook Marketplace Profile Bookmarklet",
    js: TM_facebookMarket,
    domain: "facebook.com",
  },
  {
    title: "Facebook Locked Profile Image Bookmarklet",
    js: TM_facebookProfileImage,
    domain: "facebook.com",
  },
  {
    title: "Instagram User Unauthenticated Bookmarklet",
    js: TM_instagramUauthUser,
    domain: "instagram.com",
  },
  {
    title: "Instagram: Display Post Photo",
    js: TM_instagramPhotoDisplay,
    domain: "instagram.com",
  },
  {
    title: "Instagram User ID Bookmarklet",
    js: TM_instagramUserID,
    domain: "instagram.com",
  },
  {
    title: "Instagram Profile Picture Bookmarklet",
    js: TM_instagramProfilePicture,
    domain: "instagram.com",
  },
  {
    title: "Instagram Save Single Image Bookmarklet",
    js: TM_instagramSaveSingleImage,
    domain: "instagram.com",
  },
  {
    title: "Snapchat User ID Bookmarklet",
    js: TM_snapchatUserID,
    domain: "snapchat.com",
  },
  {
    title: "Smule User ID Bookmarklet",
    js: TM_smuleUserID,
    domain: "smule.com",
  },
  {
    title: "Telegram Revealer Bookmarklet",
    js: TM_telegramReveal,
    domain: "t.me",
  },
  {
    title: "ThatsThem Deblurring Bookmarklet",
    js: TM_thatsthemDeblur,
    domain: "thatsthem.com",
  },
  {
    title: "Threads from Instagram Profile",
    js: TM_threadsFromInstagram,
    domain: "instagram.com",
  },
  {
    title: "Threads User ID Bookmarklet",
    js: TM_threadsUserID,
    domain: "threads.com",
  },
  {
    title: "TikTok User ID Bookmarklet",
    js: TM_tiktokUserID,
    domain: "tiktok.com",
  },
  {
    title: "TikTok URL Date Decoder Bookmarklet",
    js: TM_tiktokURLDecode,
    domain: "tiktok.com",
  },
  {
    title: "TikTok User/Video Bookmarklet",
    js: TM_tiktokUserVideo,
    domain: "tiktok.com",
  },
  {
    title: "United States Name Bookmarklet",
    js: TM_USnames,
    domain: "*",
  },
  {
    title: "United States Phone Bookmarklet",
    js: TM_USStatePhones,
    domain: "*",
  },
  {
    title: "Venmo User Bookmarklet",
    js: TM_venmo,
    domain: "venmo.com",
  },
  {
    title: "X Profile Banner Image Bookmarklet",
    js: TM_xProfileBannerImage,
    domain: "x.com",
  },
  {
    title: "X User ID Bookmarklet",
    js: TM_xUserID,
    domain: "x.com",
  },
];

const currentDomain = window.location.hostname.replace(/^www\./, '');

if (window.top === window.self) {
    bookmarkletsJSON.forEach(item => {
        if (currentDomain.includes(item.domain) || item.domain === '*') {
            console.log(`Initializing worker: ${item.title}`);
            GM_registerMenuCommand(item.title, item.js);
        }
    })
}