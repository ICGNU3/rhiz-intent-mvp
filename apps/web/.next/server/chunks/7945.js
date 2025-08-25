"use strict";exports.id=7945,exports.ids=[7945],exports.modules={1345:(e,t,n)=>{async function getUserId(){return"alice-user-id"}n.d(t,{n5:()=>getUserId})},24095:(e,t,n)=>{n.d(t,{vR:()=>analyzeRelationshipHealth,dL:()=>craftMessage,W1:()=>detectCapacityIssues,O$:()=>identifyReactivationOpportunities,Hr:()=>planOutreach,fo:()=>prioritizeRelationships});var a=n(91811);let i=new a.ZP({apiKey:process.env.OPENAI_API_KEY});async function callOpenAI({system:e,user:t,schema:n}){try{let a=await i.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:e},{role:"user",content:t}],response_format:{type:"json_schema",json_schema:{name:"rhiz_action",schema:n,strict:!0}},temperature:.3,max_tokens:1e3}),r=a.choices[0]?.message?.content;if(!r)throw Error("No response content from OpenAI");return JSON.parse(r)}catch(e){throw console.error("OpenAI call failed:",e),Error(`Agent call failed: ${e instanceof Error?e.message:"Unknown error"}`)}}let r={type:"object",oneOf:[{title:"relationship_prioritization",type:"object",properties:{action:{const:"relationship_prioritization"},top_contacts:{type:"array",items:{type:"object",properties:{contact_id:{type:"string"},why_now:{type:"string"},priority_score:{type:"number"},time_window_days:{type:"integer"}},required:["contact_id","priority_score","time_window_days"]}}},required:["action","top_contacts"]},{title:"graph_update",type:"object",properties:{action:{const:"graph_update"},edges:{type:"array",items:{type:"object",properties:{from:{type:"string"},to:{type:"string"},relation:{type:"string"},weight_delta:{type:"number"}},required:["from","to","relation"]}}},required:["action","edges"]},{title:"feedback_digest",type:"object",properties:{action:{const:"feedback_digest"},observations:{type:"array",items:{type:"string"}},adjustments:{type:"array",items:{type:"string"}}},required:["action","observations"]},{title:"reactivation",type:"object",properties:{action:{const:"reactivation"},contacts:{type:"array",items:{type:"object",properties:{contact_id:{type:"string"},prompt_seed:{type:"string"}},required:["contact_id"]}}},required:["action","contacts"]},{title:"outreach_plan",type:"object",properties:{action:{const:"outreach_plan"},contact_id:{type:"string"},subject:{type:"string"},message_draft:{type:"string"},follow_up_days:{type:"integer"}},required:["action","contact_id","message_draft"]}]};async function orchestrator_runAgent(e,t){let n=systemPrompt(e);return callOpenAI({system:n,user:JSON.stringify(t),schema:r})}function systemPrompt(e){let t=`You power a relationship OS grounded in Dunbar's Law, rhizomatic growth, and cybernetic feedback. 
Work inside a circle near 150. Prefer depth, cadence, and reciprocity. 
Return a single JSON action that matches the schema. Use short clear sentences.

Core Principles:
- Dunbar's Layers: Intimate (5) → Close (15) → Meaningful (50) → Stable (150) → Extended (1500)
- Rhizomatic Connections: Any-to-any discovery, non-hierarchical patterns
- Cybernetic Feedback: Continuous adaptation based on relationship health signals`;switch(e){case"mapper":return t+`

Your role: MAPPER - Relationship Prioritization & Graph Analysis
Responsibilities:
- Rank contacts by priority and urgency using relationship metrics
- Propose new graph edges based on discovered connections
- Balance Dunbar layer capacity with opportunity cost
- Identify dormant ties ready for reactivation
- Consider goal alignment and mutual benefit potential

Output: relationship_prioritization or graph_update actions`;case"sensemaker":return t+`

Your role: SENSEMAKER - Signal Analysis & Feedback Processing
Responsibilities:
- Digest interaction patterns and relationship health signals
- Identify imbalances in reciprocity, frequency, or emotional connection
- Flag overload risks within Dunbar layers
- Detect decay patterns and maintenance needs
- Provide adaptive recommendations for relationship cadence

Output: feedback_digest or reactivation actions`;case"strategist":return t+`

Your role: STRATEGIST - Outreach Planning & Timing
Responsibilities:
- Plan optimal outreach timing based on relationship context
- Match communication channels to relationship depth
- Sequence interactions for maximum relationship building
- Balance multiple relationships within capacity constraints
- Align outreach with goals and mutual interests

Output: outreach_plan or reactivation actions`;case"storyweaver":return t+`

Your role: STORYWEAVER - Message Crafting & Context Integration
Responsibilities:
- Draft authentic messages using real relationship context
- Integrate shared history, interests, and recent developments
- Match tone and formality to relationship layer and history
- Build trust through genuine connection and mutual benefit
- Create follow-up sequences that deepen relationships

Output: outreach_plan actions with crafted message content`;default:return t+" Select the appropriate action type based on the input context."}}async function prioritizeRelationships(e){return orchestrator_runAgent("mapper",{task:"prioritize_relationships",context:"Analyze relationship signals and goal context to rank contacts by priority. Consider Dunbar layer capacity, decay patterns, goal alignment, and reciprocity balance.",...e})}async function analyzeRelationshipHealth(e){return orchestrator_runAgent("sensemaker",{task:"analyze_relationship_health",context:"Process relationship signals to identify patterns, imbalances, and maintenance needs. Provide cybernetic feedback for relationship optimization.",...e})}async function detectCapacityIssues(e){return orchestrator_runAgent("sensemaker",{task:"detect_capacity_issues",context:"Analyze workload and relationship distribution across Dunbar layers. Flag overload risks and suggest rebalancing strategies.",...e})}async function identifyReactivationOpportunities(e){return orchestrator_runAgent("sensemaker",{task:"identify_reactivation_opportunities",context:"Find dormant relationships with high reactivation potential based on historical strength and strategic value.",...e})}async function planOutreach(e){return orchestrator_runAgent("strategist",{task:"plan_outreach",context:"Develop strategic outreach plan considering timing, channel, approach, and follow-up sequence. Optimize for relationship building and goal achievement.",...e})}async function craftMessage(e){return orchestrator_runAgent("storyweaver",{task:"craft_message",context:"Create authentic, personalized message using real relationship context. Build trust through genuine connection while advancing strategic goals.",...e})}}};