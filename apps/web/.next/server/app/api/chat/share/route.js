"use strict";(()=>{var e={};e.id=7296,e.ids=[7296],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},17931:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>h,originalPathname:()=>m,requestAsyncStorage:()=>l,routeModule:()=>u,serverHooks:()=>c,staticGenerationAsyncStorage:()=>p,staticGenerationBailout:()=>d});var a={};t.r(a),t.d(a,{POST:()=>POST});var o=t(10884),i=t(16132),s=t(95798),n=t(57279);async function POST(e){try{await (0,n.Vc)();let{personId:r,purpose:t,questions:a}=await e.json();if(!r||!t)return s.Z.json({error:"Person ID and purpose are required"},{status:400});let o={id:r,name:"Sarah Chen",email:"sarah.chen@stripe.com",role:"CTO",company:"Stripe"},i=`reply-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,u=`rhiz-${i}@rhiz.app`,l={to:o.email,subject:`Rhiz - ${t}`,body:`Hi ${o.name},

Israel asked me to check in so I can help find useful introductions. 

What are your top priorities right now? Are you hiring, raising, or looking for customers? Anything off-limits?

I'll help connect you with relevant people in our network.

Best,
Rhiz

---
Reply to this email to continue the conversation. Your response will be shared with Israel.`};return s.Z.json({success:!0,person:o,emailDraft:l,replyToAddress:u,token:i})}catch(e){return console.error("Chat share error:",e),s.Z.json({error:"Failed to generate share link"},{status:500})}}let u=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/chat/share/route",pathname:"/api/chat/share",filename:"route",bundlePath:"app/api/chat/share/route"},resolvedPagePath:"/Users/israelwilson/Developer/rhiz-intent-mvp/apps/web/app/api/chat/share/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:l,staticGenerationAsyncStorage:p,serverHooks:c,headerHooks:h,staticGenerationBailout:d}=u,m="/api/chat/share/route"},57279:(e,r,t)=>{async function requireUser(){return{id:"demo-user",fullName:"Demo User",email:"demo@rhiz.local"}}function getUserId(){return"demo-user"}t.d(r,{Vc:()=>requireUser,n5:()=>getUserId})}};var r=require("../../../../webpack-runtime.js");r.C(e);var __webpack_exec__=e=>r(r.s=e),t=r.X(0,[729,5798],()=>__webpack_exec__(17931));module.exports=t})();