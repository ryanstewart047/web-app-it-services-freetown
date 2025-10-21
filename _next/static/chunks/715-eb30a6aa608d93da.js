"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[715],{2898:function(e,t,r){r.d(t,{Z:function(){return n}});var a=r(2265),o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),n=(e,t)=>{let r=(0,a.forwardRef)(({color:r="currentColor",size:n=24,strokeWidth:i=2,absoluteStrokeWidth:l,className:c="",children:d,...u},m)=>(0,a.createElement)("svg",{ref:m,...o,width:n,height:n,stroke:r,strokeWidth:l?24*Number(i)/Number(n):i,className:["lucide",`lucide-${s(e)}`,c].join(" "),...u},[...t.map(([e,t])=>(0,a.createElement)(e,t)),...Array.isArray(d)?d:[d]]));return r.displayName=`${e}`,r}},2357:function(e,t,r){r.d(t,{BC:function(){return i},I7:function(){return l},PC:function(){return n}});let a="ryanstewart047",o="web-app-it-services-freetown",s="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";async function n(){try{let e={Accept:"application/vnd.github.v3+json"};s&&(e.Authorization="token ".concat(s));let t=await fetch("https://api.github.com/repos/".concat(a,"/").concat(o,"/issues?labels=blog-post&state=open&sort=created&direction=desc"),{headers:e});if(!t.ok)throw Error("Failed to fetch posts");return(await t.json()).map(e=>{let t=e.body||"",r=function(e){console.log("extractMetadata called, body length:",e.length);let t=e.match(/<!-- METADATA\n([\s\S]*?)\n-->/m);if(!t)return console.log("No metadata found in body"),{content:e};let r=t[1];console.log("Metadata text:",r);let a=r.match(/Author: (.+)/),o=r.match(/Media: ([\s\S]+?)(?:\n|$)/),s=[];if(o)try{let e=o[1].trim();console.log("Media JSON to parse:",e),s=JSON.parse(e),console.log("Parsed media:",s)}catch(e){console.error("Error parsing media JSON:",e),s=[]}else console.log("No media match found");let n=e.replace(/<!-- METADATA[\s\S]*?-->\n\n/,"");return{content:(n=n.replace(/\n\n---\n### Media\n\n[\s\S]*$/,"")).trim(),author:null==a?void 0:a[1],media:s.length>0?s:void 0}}(t);return{id:e.number.toString(),title:e.title,content:r.content,author:r.author||"IT Services Freetown",date:new Date(e.created_at).toISOString().split("T")[0],likes:e.reactions["+1"]||0,dislikes:e.reactions["-1"]||0,media:r.media,comments:[],githubIssueNumber:e.number}})}catch(e){return console.error("Error fetching blog posts:",e),[]}}async function i(e){try{let t={Accept:"application/vnd.github.v3+json"};s&&(t.Authorization="token ".concat(s));let r=await fetch("https://api.github.com/repos/".concat(a,"/").concat(o,"/issues/").concat(e,"/comments"),{headers:t});if(!r.ok)throw Error("Failed to fetch comments");return(await r.json()).map(e=>({id:e.id.toString(),author:e.user.login,content:e.body,timestamp:new Date(e.created_at)}))}catch(e){return console.error("Error fetching comments:",e),[]}}async function l(e,t,r,n){try{let i;if(!s)return{success:!1,error:"GitHub token required to create posts. Configure NEXT_PUBLIC_GITHUB_TOKEN in .env.local"};let l=(console.log("formatPostBody called with media:",n),i="<!-- METADATA\nAuthor: ".concat(r,"\nMedia: ").concat(n&&n.length>0?JSON.stringify(n):"[]","\n-->\n\n")+t,n&&n.length>0&&(i+="\n\n---\n### Media\n\n",n.forEach((e,t)=>{"image"===e.type?(i+="![".concat(e.caption||"Image ".concat(t+1),"](").concat(e.url,")\n"),e.caption&&(i+="*".concat(e.caption,"*\n\n"))):"video"===e.type&&(i+="\n**Video ".concat(t+1,"**").concat(e.caption?": ".concat(e.caption):"","\n")+"[View Video](".concat(e.url,")\n\n"))})),console.log("Formatted body length:",i.length),i),c=await fetch("https://api.github.com/repos/".concat(a,"/").concat(o,"/issues"),{method:"POST",headers:{Accept:"application/vnd.github.v3+json",Authorization:"token ".concat(s),"Content-Type":"application/json"},body:JSON.stringify({title:e,body:l,labels:["blog-post"]})});if(!c.ok){let e=await c.json();throw Error(e.message||"Failed to create post")}let d=await c.json();return{success:!0,issueNumber:d.number}}catch(e){return console.error("Error creating blog post:",e),{success:!1,error:e.message||"Failed to create post"}}}},5142:function(e,t,r){r.d(t,{Z:function(){return s}});var a=r(7437),o=r(2265);function s(e){let{variant:t="modern",message:r="Loading expert repair services...",progress:s}=e,[n,i]=(0,o.useState)(0),[l,c]=(0,o.useState)(0),d=void 0!==s?s:n,u=["Connecting to expert technicians...","Loading service information...","Preparing your experience...","Almost ready!"];(0,o.useEffect)(()=>{if(void 0===s){let e=setInterval(()=>{i(e=>e>=90?e:e+15*Math.random())},200);return()=>clearInterval(e)}},[s]),(0,o.useEffect)(()=>{let e=setInterval(()=>{c(e=>(e+1)%u.length)},800);return()=>{clearInterval(e)}},[]);let m=()=>{switch(t){case"modern":return(0,a.jsxs)("div",{className:"modern-loader relative",children:[(0,a.jsx)("div",{className:"absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50 animate-pulse"}),(0,a.jsxs)("div",{className:"relative z-10 text-center px-8",children:[(0,a.jsx)("div",{className:"mb-8 transform hover:scale-105 transition-transform duration-500",children:(0,a.jsxs)("div",{className:"relative w-24 h-24 mx-auto",children:[(0,a.jsx)("div",{className:"absolute inset-0 rounded-full border-4 border-primary-200 animate-spin-slow"}),(0,a.jsx)("div",{className:"absolute inset-2 rounded-full border-4 border-t-primary-600 border-r-red-500 border-b-primary-600 border-l-red-500 animate-spin"}),(0,a.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,a.jsx)("i",{className:"fas fa-tools text-2xl text-primary-600 animate-pulse"})})]})}),(0,a.jsx)("p",{className:"text-lg text-gray-600 mb-8 font-medium",children:u[l]}),(0,a.jsxs)("div",{className:"w-full max-w-xs mx-auto mb-6",children:[(0,a.jsx)("div",{className:"h-2 bg-gray-200 rounded-full overflow-hidden",children:(0,a.jsx)("div",{className:"h-full bg-gradient-to-r from-primary-600 to-red-500 rounded-full transition-all duration-300 ease-out",style:{width:"".concat(d,"%")}})}),(0,a.jsxs)("p",{className:"text-sm text-gray-500 mt-2 font-medium",children:[Math.round(d),"% Complete"]})]}),(0,a.jsxs)("div",{className:"flex justify-center space-x-6 text-xs text-gray-500",children:[(0,a.jsxs)("div",{className:"flex items-center space-x-1",children:[(0,a.jsx)("div",{className:"w-2 h-2 bg-green-400 rounded-full animate-pulse"}),(0,a.jsx)("span",{children:"Expert Technicians"})]}),(0,a.jsxs)("div",{className:"flex items-center space-x-1",children:[(0,a.jsx)("div",{className:"w-2 h-2 bg-blue-400 rounded-full animate-pulse",style:{animationDelay:"0.5s"}}),(0,a.jsx)("span",{children:"Real-time Tracking"})]}),(0,a.jsxs)("div",{className:"flex items-center space-x-1",children:[(0,a.jsx)("div",{className:"w-2 h-2 bg-red-400 rounded-full animate-pulse",style:{animationDelay:"1s"}}),(0,a.jsx)("span",{children:"Quality Service"})]})]})]})]});case"minimal":return(0,a.jsxs)("div",{className:"minimal-loader text-center",children:[(0,a.jsxs)("div",{className:"relative w-16 h-16 mx-auto mb-6",children:[(0,a.jsx)("div",{className:"absolute inset-0 border-4 border-gray-200 rounded-full"}),(0,a.jsx)("div",{className:"absolute inset-0 border-4 border-t-primary-600 rounded-full animate-spin"})]}),(0,a.jsx)("h3",{className:"text-xl font-semibold text-gray-800 mb-2",children:"IT Services Freetown"}),(0,a.jsx)("p",{className:"text-gray-600",children:r})]});case"dots":return(0,a.jsxs)("div",{className:"dots-loader text-center",children:[(0,a.jsx)("div",{className:"flex justify-center space-x-2 mb-8",children:[0,1,2,3,4].map(e=>(0,a.jsx)("div",{className:"w-3 h-3 bg-primary-600 rounded-full animate-bounce",style:{animationDelay:"".concat(.1*e,"s")}},e))}),(0,a.jsx)("h3",{className:"text-xl font-semibold text-gray-800 mb-2",children:"IT Services Freetown"}),(0,a.jsx)("p",{className:"text-gray-600",children:r})]});case"pulse":return(0,a.jsxs)("div",{className:"pulse-loader text-center",children:[(0,a.jsxs)("div",{className:"relative w-20 h-20 mx-auto mb-6",children:[(0,a.jsx)("div",{className:"absolute inset-0 bg-primary-600 rounded-full animate-ping opacity-20"}),(0,a.jsx)("div",{className:"absolute inset-2 bg-primary-600 rounded-full animate-ping opacity-40",style:{animationDelay:"0.3s"}}),(0,a.jsx)("div",{className:"absolute inset-4 bg-primary-600 rounded-full animate-pulse"}),(0,a.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,a.jsx)("i",{className:"fas fa-microchip text-white text-xl"})})]}),(0,a.jsx)("h3",{className:"text-xl font-semibold text-gray-800 mb-2",children:"IT Services Freetown"}),(0,a.jsx)("p",{className:"text-gray-600",children:r})]});default:return m()}};return(0,a.jsx)("div",{className:"loading-overlay-pro fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50",children:m()})}},1066:function(e,t,r){r.d(t,{X:function(){return o}});var a=r(2265);function o(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{minLoadTime:t=1e3}=e,[r,o]=(0,a.useState)(!0),[s,n]=(0,a.useState)(0);return(0,a.useEffect)(()=>{let e=setInterval(()=>{n(t=>t>=90?(clearInterval(e),90):t+10)},t/10),r=setTimeout(()=>{n(100),setTimeout(()=>{o(!1)},200)},t);return()=>{clearInterval(e),clearTimeout(r)}},[t]),{isLoading:r,progress:s}}},2835:function(e,t,r){r.d(t,{c:function(){return o}});var a=r(2265);function o(){(0,a.useEffect)(()=>{let e=new IntersectionObserver(t=>{t.forEach(t=>{t.isIntersecting&&(t.target.classList.add("animate-in"),e.unobserve(t.target))})},{threshold:.1,rootMargin:"0px 0px -50px 0px"}),t=document.querySelectorAll("[data-animate]");return t.forEach(t=>e.observe(t)),()=>{t.forEach(t=>e.unobserve(t))}},[])}},622:function(e,t,r){var a=r(2265),o=Symbol.for("react.element"),s=Symbol.for("react.fragment"),n=Object.prototype.hasOwnProperty,i=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function c(e,t,r){var a,s={},c=null,d=null;for(a in void 0!==r&&(c=""+r),void 0!==t.key&&(c=""+t.key),void 0!==t.ref&&(d=t.ref),t)n.call(t,a)&&!l.hasOwnProperty(a)&&(s[a]=t[a]);if(e&&e.defaultProps)for(a in t=e.defaultProps)void 0===s[a]&&(s[a]=t[a]);return{$$typeof:o,type:e,key:c,ref:d,props:s,_owner:i.current}}t.Fragment=s,t.jsx=c,t.jsxs=c},7437:function(e,t,r){e.exports=r(622)},5925:function(e,t,r){let a,o;r.r(t),r.d(t,{CheckmarkIcon:function(){return Q},ErrorIcon:function(){return Z},LoaderIcon:function(){return q},ToastBar:function(){return ei},ToastIcon:function(){return et},Toaster:function(){return eu},default:function(){return em},resolveValue:function(){return E},toast:function(){return M},useToaster:function(){return R},useToasterStore:function(){return D}});var s,n=r(2265);let i={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||i,c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,m=(e,t)=>{let r="",a="",o="";for(let s in e){let n=e[s];"@"==s[0]?"i"==s[1]?r=s+" "+n+";":a+="f"==s[1]?m(n,s):s+"{"+m(n,"k"==s[1]?"":t)+"}":"object"==typeof n?a+=m(n,t?t.replace(/([^,])+/g,e=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):s):null!=n&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=m.p?m.p(s,n):s+":"+n+";")}return r+(t&&o?t+"{"+o+"}":o)+a},p={},f=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+f(e[r]);return t}return e},h=(e,t,r,a,o)=>{var s;let n=f(e),i=p[n]||(p[n]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(n));if(!p[i]){let t=n!==e?e:(e=>{let t,r,a=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);p[i]=m(o?{["@keyframes "+i]:t}:t,r?"":"."+i)}let l=r&&p.g?p.g:null;return r&&(p.g=p[i]),s=p[i],l?t.data=t.data.replace(l,s):-1===t.data.indexOf(s)&&(t.data=a?s+t.data:t.data+s),i},g=(e,t,r)=>e.reduce((e,a,o)=>{let s=t[o];if(s&&s.call){let e=s(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;s=t?"."+t:e&&"object"==typeof e?e.props?"":m(e,""):!1===e?"":e}return e+a+(null==s?"":s)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?g(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}y.bind({g:1});let b,x,v,w=y.bind({k:1});function j(e,t){let r=this||{};return function(){let a=arguments;function o(s,n){let i=Object.assign({},s),l=i.className||o.className;r.p=Object.assign({theme:x&&x()},i),r.o=/ *go\d+/.test(l),i.className=y.apply(r,a)+(l?" "+l:""),t&&(i.ref=n);let c=e;return e[0]&&(c=i.as||e,delete i.as),v&&c[0]&&v(i),b(c,i)}return t?t(o):o}}var N=e=>"function"==typeof e,E=(e,t)=>N(e)?e(t):e,k=(a=0,()=>(++a).toString()),S=()=>{if(void 0===o&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");o=!e||e.matches}return o},T=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return T(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},I=[],A={toasts:[],pausedAt:void 0},O=e=>{A=T(A,e),I.forEach(e=>{e(A)})},_={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},D=(e={})=>{let[t,r]=(0,n.useState)(A),a=(0,n.useRef)(A);(0,n.useEffect)(()=>(a.current!==A&&r(A),I.push(r),()=>{let e=I.indexOf(r);e>-1&&I.splice(e,1)}),[]);let o=t.toasts.map(t=>{var r,a,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||_[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...t,toasts:o}},$=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||k()}),C=e=>(t,r)=>{let a=$(t,e,r);return O({type:2,toast:a}),a.id},M=(e,t)=>C("blank")(e,t);M.error=C("error"),M.success=C("success"),M.loading=C("loading"),M.custom=C("custom"),M.dismiss=e=>{O({type:3,toastId:e})},M.remove=e=>O({type:4,toastId:e}),M.promise=(e,t,r)=>{let a=M.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?E(t.success,e):void 0;return o?M.success(o,{id:a,...r,...null==r?void 0:r.success}):M.dismiss(a),e}).catch(e=>{let o=t.error?E(t.error,e):void 0;o?M.error(o,{id:a,...r,...null==r?void 0:r.error}):M.dismiss(a)}),e};var P=(e,t)=>{O({type:1,toast:{id:e,height:t}})},z=()=>{O({type:5,time:Date.now()})},F=new Map,L=1e3,B=(e,t=L)=>{if(F.has(e))return;let r=setTimeout(()=>{F.delete(e),O({type:4,toastId:e})},t);F.set(e,r)},R=e=>{let{toasts:t,pausedAt:r}=D(e);(0,n.useEffect)(()=>{if(r)return;let e=Date.now(),a=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&M.dismiss(t.id);return}return setTimeout(()=>M.dismiss(t.id),r)});return()=>{a.forEach(e=>e&&clearTimeout(e))}},[t,r]);let a=(0,n.useCallback)(()=>{r&&O({type:6,time:Date.now()})},[r]),o=(0,n.useCallback)((e,r)=>{let{reverseOrder:a=!1,gutter:o=8,defaultPosition:s}=r||{},n=t.filter(t=>(t.position||s)===(e.position||s)&&t.height),i=n.findIndex(t=>t.id===e.id),l=n.filter((e,t)=>t<i&&e.visible).length;return n.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[t]);return(0,n.useEffect)(()=>{t.forEach(e=>{if(e.dismissed)B(e.id,e.removeDelay);else{let t=F.get(e.id);t&&(clearTimeout(t),F.delete(e.id))}})},[t]),{toasts:t,handlers:{updateHeight:P,startPause:z,endPause:a,calculateOffset:o}}},H=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,J=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Z=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${J} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,V=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,q=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${V} 1s linear infinite;
`,G=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,W=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Q=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${G} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${W} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,X=j("div")`
  position: absolute;
`,Y=j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,K=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ee=j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${K} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,et=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?n.createElement(ee,null,t):t:"blank"===r?null:n.createElement(Y,null,n.createElement(q,{...a}),"loading"!==r&&n.createElement(X,null,"error"===r?n.createElement(Z,{...a}):n.createElement(Q,{...a})))},er=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ea=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,eo=j("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,es=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,o]=S()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[er(r),ea(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ei=n.memo(({toast:e,position:t,style:r,children:a})=>{let o=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},s=n.createElement(et,{toast:e}),i=n.createElement(es,{...e.ariaProps},E(e.message,e));return n.createElement(eo,{className:e.className,style:{...o,...r,...e.style}},"function"==typeof a?a({icon:s,message:i}):n.createElement(n.Fragment,null,s,i))});s=n.createElement,m.p=void 0,b=s,x=void 0,v=void 0;var el=({id:e,className:t,style:r,onHeightUpdate:a,children:o})=>{let s=n.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return n.createElement("div",{ref:s,className:t,style:r},o)},ec=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:S()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},ed=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,eu=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:o,containerStyle:s,containerClassName:i})=>{let{toasts:l,handlers:c}=R(r);return n.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:i,onMouseEnter:c.startPause,onMouseLeave:c.endPause},l.map(r=>{let s=r.position||t,i=ec(s,c.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return n.createElement(el,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?ed:"",style:i},"custom"===r.type?E(r.message,r):o?o(r):n.createElement(ei,{toast:r,position:s}))}))},em=M}}]);