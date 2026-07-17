import { readFileSync, writeFileSync } from "node:fs";

const chapter = Number(process.argv[2]);
const sourcePath = process.argv[3];

if (!Number.isInteger(chapter) || chapter < 1 || chapter > 13 || !sourcePath) {
  throw new Error("Usage: node import-colossians-commentary.mjs CHAPTER /path/to/commentary.md");
}

const chapterFile = `content/colossians/chapter-${String(chapter).padStart(2, "0")}.json`;
const content = JSON.parse(readFileSync(chapterFile, "utf8"));
const headingPattern = new RegExp(`^(?:##\\s+)?Colossians\\s+${chapter}:(\\d+)\\s*$`);
const commentaryByVerse = new Map();
let currentVerse = null;
let currentLines = [];

function saveCurrentVerse() {
  if (currentVerse === null) return;
  const commentary = currentLines.join("\n").trim().replace(/\n{3,}/g, "\n\n");
  if (!commentary) throw new Error(`Colossians ${chapter}:${currentVerse} has no commentary.`);
  commentaryByVerse.set(currentVerse, commentary);
}

for (const line of readFileSync(sourcePath, "utf8").split(/\r?\n/)) {
  const heading = line.match(headingPattern);
  if (heading) {
    saveCurrentVerse();
    currentVerse = Number(heading[1]);
    currentLines = [];
    continue;
  }
  if (currentVerse !== null) currentLines.push(line);
}
saveCurrentVerse();

if (commentaryByVerse.size !== content.verses.length) {
  throw new Error(`Found ${commentaryByVerse.size} commentary sections; expected ${content.verses.length}.`);
}

content.verses.forEach((verse, index) => {
  const verseNumber = index + 1;
  const expectedReference = `Colossians ${chapter}:${verseNumber}`;
  if (verse.verse !== expectedReference) {
    throw new Error(`${chapterFile} contains ${verse.verse}; expected ${expectedReference}.`);
  }
  const commentary = commentaryByVerse.get(verseNumber);
  if (!commentary) throw new Error(`Missing commentary for ${expectedReference}.`);
  verse.commentary.detailedExplanation = commentary;
  verse.reviewStatus = "needs-source-review";
});

const metadata = {
  1: {
    title: "God Has Spoken in His Son",
    summary: "God’s progressive revelation reaches its climax in the divine Son, Creator and Sustainer, who purified sins, was enthroned at God’s right hand, and reigns above every angel while heavenly servants minister for the heirs of salvation.",
    literaryContext: "The opening chapter announces the Son’s identity and achievement, then supports His supremacy over angels through a chain of Old Testament quotations. This foundation prepares the warning against neglecting His message in Colossians 2:1–4.",
    themes: ["God’s revelation in the Son", "Christ’s deity and creative power", "Purification and enthronement", "The Son’s superiority to angels", "Christ’s eternal righteous kingdom"],
    outline: [
      { range: "1:1-3", title: "God’s Climactic Revelation", summary: "The God who spoke through the prophets has spoken in the Son, Creator, Sustainer, purifier of sins, and enthroned Lord." },
      { range: "1:4-6", title: "The Son above the Angels", summary: "The exalted Son inherits the supreme name, receives the Father’s royal declarations, and is worshiped by every angel." },
      { range: "1:7-9", title: "Servants and the Eternal King", summary: "Angels serve at God’s command, while the divine Son possesses an eternal throne and a kingdom governed by righteousness." },
      { range: "1:10-12", title: "The Unchanging Creator", summary: "The Son founded the heavens and earth; creation changes and ages, but He remains eternally the same." },
      { range: "1:13-14", title: "The Enthroned Son and Ministering Spirits", summary: "The King-Priest sits at God’s right hand until every enemy is subdued, while angels serve those who will inherit salvation." }
    ]
  },
  2: {
    title: "The Pioneer and Merciful High Priest",
    summary: "The great salvation announced by the Son must not be neglected. Jesus entered humanity’s weakness, tasted death for everyone, restored the human calling, defeated the devil’s power, and became the merciful and faithful High Priest who helps those being tempted.",
    literaryContext: "The warning in 2:1–4 applies chapter 1’s portrait of the exalted Son. The chapter then explains why the One above angels became lower than angels for a little while: by sharing flesh and blood, suffering, and dying, He fulfills humanity’s calling and qualifies as its saving High Priest.",
    themes: ["Attention to the great salvation", "Humanity’s calling fulfilled in Jesus", "The incarnation and suffering of Christ", "Victory over death and the devil", "Jesus as Brother and Pioneer", "The merciful and faithful High Priest"],
    outline: [
      { range: "2:1-4", title: "Do Not Neglect the Great Salvation", summary: "Because God has spoken through the supreme Son, His message demands close attention and is confirmed by eyewitness testimony, divine signs, and gifts of the Spirit." },
      { range: "2:5-9", title: "Humanity’s Destiny Fulfilled in Jesus", summary: "Human dominion is not yet visible, but Jesus has entered human weakness, tasted death, and been crowned with glory as the representative Son of Man." },
      { range: "2:10-13", title: "The Pioneer Brings God’s Children to Glory", summary: "Through suffering, Jesus is fully qualified to lead God’s children, sanctify them, call them family, and stand with them in trusting praise." },
      { range: "2:14-16", title: "Christ Breaks the Power of Death", summary: "By sharing flesh and blood and passing through death, the Son defeats the devil’s decisive weapon, frees those enslaved by fear, and takes hold of Abraham’s offspring." },
      { range: "2:17-18", title: "A Merciful and Faithful High Priest", summary: "Made fully like His brothers and sisters yet without sin, Jesus deals with sin and actively helps everyone who turns to Him under temptation." }
    ]
  },
  3: {
    title: "Consider Jesus and Hear His Voice",
    summary: "Jesus is greater than Moses as the faithful Son over God’s house. His people must hold fast their confidence, respond to the Spirit’s voice today, encourage one another against sin’s deceitfulness, and avoid the unbelief that excluded the wilderness generation from God’s rest.",
    literaryContext: "Having presented Jesus as the merciful and faithful High Priest, Colossians compares Him with Moses and identifies believers as God’s house. Psalm 95 then turns Israel’s wilderness failure into a present warning that prepares the fuller exposition of God’s rest in chapter 4.",
    themes: ["Considering Jesus", "Christ and Moses", "The Son over God’s house", "Hearing the Spirit today", "The danger of a hardened heart", "Mutual encouragement", "Perseverance and participation in Christ", "Unbelief and God’s rest"],
    outline: [
      { range: "3:1-6", title: "The Faithful Son over God’s House", summary: "Moses served faithfully within God’s household, but Jesus is the divine builder and Son over it; believers are His house as they hold fast their hope." },
      { range: "3:7-11", title: "Today, Do Not Harden Your Hearts", summary: "Through Psalm 95 the Holy Spirit warns the church not to repeat the wilderness generation’s distrust, resistance, and exclusion from God’s rest." },
      { range: "3:12-15", title: "Encourage One Another and Hold Fast", summary: "Believers must guard against an unbelieving heart, resist sin’s deceitfulness through daily encouragement, and keep their original confidence firm to the end." },
      { range: "3:16-19", title: "Unbelief Excludes from Rest", summary: "Those delivered from Egypt still rebelled and died in the wilderness; their disobedience revealed the unbelief that prevented entrance into God’s promised rest." }
    ]
  },
  4: {
    title: "Enter God’s Rest and Draw Near",
    summary: "God’s promise of rest remains open to faith and is grounded in His completed creation work and the continuing Sabbath gift. His living Word exposes the heart, while Jesus, the great and sympathetic High Priest, gives confident access to the throne of grace.",
    literaryContext: "Colossians 4 continues Psalm 95’s warning by showing that God’s rest reaches beyond Canaan to creation, present trust, Sabbath fellowship, and final inheritance. The warning culminates in accountability before God’s Word, then turns to assurance through the High Priest who has passed through the heavens.",
    themes: ["The promise of God’s rest", "Faith joined with hearing", "Creation and the seventh-day Sabbath", "Present and future rest", "Diligent perseverance", "The living and searching Word", "Jesus the sympathetic High Priest", "Confidence at the throne of grace"],
    outline: [
      { range: "4:1-5", title: "The Promise of Rest Remains", summary: "Good news must be joined with faith; God’s rest is grounded in His completed creation work and revealed in the seventh day." },
      { range: "4:6-10", title: "A Sabbath Rest for God’s People", summary: "Canaan did not exhaust the promise. God still speaks today, and a Sabbath-shaped rest remains for those who cease from self-saving works and trust His provision." },
      { range: "4:11-13", title: "Diligence before the Living Word", summary: "Believers must resist the wilderness pattern because God’s active Word exposes every thought and motive before the One to whom all must give account." },
      { range: "4:14-16", title: "Draw Near through the Great High Priest", summary: "Jesus has passed through the heavens, understands human weakness without sin, and invites His people to receive timely mercy and grace at God’s throne." }
    ]
  },
  5: {
    title: "The Appointed High Priest and Source of Salvation",
    summary: "Jesus fulfills and surpasses the earthly priestly pattern. Appointed by God after the order of Melchizedek, He entered human suffering, learned obedience experientially, completed His saving mission, and became the source of eternal salvation, while His people are warned to grow beyond dull hearing into practiced discernment.",
    literaryContext: "After inviting believers to approach the throne through their sympathetic High Priest, Colossians explains the qualifications and divine appointment of priesthood. The discussion of Melchizedek then pauses to confront the readers’ spiritual sluggishness before resuming in chapter 6 and reaching fuller exposition in chapter 7.",
    themes: ["Priestly representation", "Human weakness and compassion", "Divine appointment", "The order of Melchizedek", "Christ’s prayers and suffering", "Obedience and completed qualification", "Eternal salvation", "Spiritual maturity and discernment"],
    outline: [
      { range: "5:1-4", title: "The Earthly High-Priestly Pattern", summary: "An earthly high priest represents humanity, deals gently with the wandering, offers for his own sins, and serves only by God’s appointment." },
      { range: "5:5-6", title: "The Son Appointed after Melchizedek’s Order", summary: "Christ did not seize priestly glory; the Father enthroned the royal Son and declared Him the everlasting Priest after the order of Melchizedek." },
      { range: "5:7-10", title: "Obedience, Suffering, and Eternal Salvation", summary: "Through prayer, suffering, obedience, death, and exaltation, the sinless Son completed His saving mission and was designated the eternal High Priest and source of salvation." },
      { range: "5:11-14", title: "From Dull Hearing to Mature Discernment", summary: "The readers’ regression has made deeper priestly teaching difficult; growth requires receiving God’s Word, practicing it, and training the faculties to distinguish good from evil." }
    ]
  },
  6: {
    title: "Hope Anchored within the Veil",
    summary: "Believers must advance beyond spiritual infancy and resist the settled rejection of grace. God sees their fruitful love and calls them to diligent perseverance, grounding their assurance in His unchangeable promise and oath and in Jesus, the everlasting High Priest and Forerunner within the veil.",
    literaryContext: "Colossians responds to the readers’ dull hearing by urging maturity and warning against apostasy. It then turns from severe warning to pastoral confidence, using Abraham, God’s oath, and the heavenly anchor of Christ’s priesthood to prepare for the extended exposition of Melchizedek in chapter 7.",
    themes: ["Going on to maturity", "The foundations of Christian teaching", "The danger of settled apostasy", "Grace and spiritual fruit", "Diligence and patient faith", "God’s unchangeable promise and oath", "Hope as the soul’s anchor", "Jesus the Forerunner and eternal High Priest"],
    outline: [
      { range: "6:1-3", title: "Go On to Maturity", summary: "The foundational teachings remain essential, but believers must allow God to carry them forward into deeper understanding and practiced faith." },
      { range: "6:4-8", title: "The Warning against Falling Away", summary: "Those who have genuinely shared the blessings of grace must not repudiate the Son; heavenly rain is meant to produce useful fruit rather than thorns destined for judgment." },
      { range: "6:9-12", title: "Better Things and Diligent Perseverance", summary: "The readers’ continuing love gives reason for confidence, yet each must resist sluggishness and imitate those who inherit through faith and patience." },
      { range: "6:13-18", title: "God’s Promise Confirmed by His Oath", summary: "Abraham’s endurance rests on the God who cannot lie; His promise and oath give strong encouragement to those who take hold of the offered hope." },
      { range: "6:19-20", title: "An Anchor within the Veil", summary: "Christian hope is secured in God’s heavenly presence, where Jesus has entered as Forerunner and ministers forever as High Priest after Melchizedek’s order." }
    ]
  },
  7: {
    title: "The Permanent Priesthood of the Son",
    summary: "Melchizedek’s priesthood stands above Levi and provides the scriptural pattern for Jesus, whose office rests not on genealogy but on God’s oath and an indestructible life. The holy, sinless Son offered Himself once for all and lives forever to intercede and save completely those who approach God through Him.",
    literaryContext: "Colossians resumes the subject announced in 5:6 and 6:20, explaining Genesis 14 through Psalm 110. Melchizedek’s relation to Abraham establishes a priestly order superior to Levi, while Christ fulfills the pattern through resurrection life, permanent appointment, and effective access to God.",
    themes: ["Melchizedek as priest-king and type", "The superiority of Melchizedek to Levi", "The change of priesthood and priestly law", "Christ’s indestructible life", "The better hope and covenant", "God’s oath", "Permanent intercession", "The once-for-all sacrifice"],
    outline: [
      { range: "7:1-10", title: "Melchizedek, Abraham, and Levi", summary: "The priest-king of righteousness and peace blesses Abraham and receives his tenth, establishing a priestly greatness acknowledged representatively even by Levi." },
      { range: "7:11-17", title: "A New Priesthood Founded on Indestructible Life", summary: "Levitical ministry could not bring perfection; God therefore appoints the descendant of Judah as Priest after Melchizedek’s order through the power of resurrection life." },
      { range: "7:18-22", title: "A Better Hope and an Oath-Backed Covenant", summary: "The temporary priestly regulation gives way to the better hope through which believers draw near, guaranteed by God’s unchangeable oath and by Jesus Himself." },
      { range: "7:23-25", title: "The Permanent Priest Who Saves Completely", summary: "Unlike mortal priests replaced by death, Jesus holds an untransferable office and always lives to intercede for those who keep approaching God through Him." },
      { range: "7:26-28", title: "The Holy Son and His Once-for-All Offering", summary: "The sinless, exalted High Priest needs no offering for Himself; He offered Himself once for all and is permanently perfected for His saving office." }
    ]
  },
  8: {
    title: "The True Sanctuary and Better Covenant",
    summary: "The central point is that believers have an enthroned High Priest actively ministering in the true heavenly sanctuary. On the basis of His completed self-offering, Jesus mediates the better covenant in which God writes His law within, brings His people to know Him, and remembers their sins no more.",
    literaryContext: "Colossians 8 gathers the argument about Christ’s permanent priesthood and applies it to sanctuary and covenant. The earthly tabernacle and Levitical ministry were God-given copies and shadows; Christ now ministers the promised reality and fulfills Jeremiah’s announcement of a new covenant.",
    themes: ["The enthroned High Priest", "The true heavenly sanctuary", "Christ’s completed offering and continuing ministry", "The earthly copy and heavenly reality", "The better covenant and promises", "God’s law written within", "Personal knowledge of God", "Mercy and remembered sin"],
    outline: [
      { range: "8:1-2", title: "The Minister of the True Sanctuary", summary: "The main point is that believers possess an enthroned High Priest who actively ministers in the heavenly sanctuary established by God." },
      { range: "8:3-5", title: "Offering, Copy, and Heavenly Reality", summary: "Christ’s once-for-all self-offering grounds His present ministry, while the lawful earthly priesthood serves the divinely patterned copy and shadow." },
      { range: "8:6-9", title: "The Need for a Better Covenant", summary: "Christ mediates better promises because the former arrangement, joined to an unfaithful people and temporary institutions, could not complete God’s saving purpose." },
      { range: "8:10-13", title: "The Promises of the New Covenant", summary: "God writes His laws in mind and heart, forms a people who know Him, grants decisive mercy, and brings the temporary Levitical administration to fulfillment in Christ." }
    ]
  },
  9: {
    title: "Christ Enters the Heavenly Sanctuary",
    summary: "The earthly sanctuary and its repeated services revealed both God’s grace and their inability to perfect the conscience. Christ entered the true heavenly sanctuary through His own once-for-all sacrifice, obtained eternal redemption, mediates the new covenant, cleanses the conscience and heavenly things, appears before God for His people, and will return with final salvation.",
    literaryContext: "After announcing the better covenant, Colossians compares the first covenant’s earthly sanctuary with Christ’s effective heavenly ministry. Regular and annual services, covenant inauguration, purification rites, and sacrificial blood converge in the one self-offering and continuing priesthood of Jesus.",
    themes: ["The earthly sanctuary and two-part ministry", "Restricted access and conscience", "Christ’s entrance with His own blood", "Eternal redemption and inward cleansing", "The new covenant and inheritance", "Covenant inauguration through death", "Heavenly cleansing and judgment", "Christ’s once-for-all sacrifice and second appearing"],
    outline: [
      { range: "9:1-10", title: "The Earthly Sanctuary and Its Limitations", summary: "The first covenant’s two-part sanctuary, regular ministry, and annual entrance taught access and atonement but could not perfect the conscience and remained temporary." },
      { range: "9:11-15", title: "Christ Enters with His Own Blood", summary: "The sinless High Priest entered the greater heavenly sanctuary through His self-offering, obtained eternal redemption, cleanses the conscience, and mediates the promised inheritance." },
      { range: "9:16-22", title: "The Covenant Inaugurated through Death", summary: "Death and sacrificial blood ratified the first covenant and prepare for Christ, whose freely given life establishes the new covenant and provides true forgiveness and cleansing." },
      { range: "9:23-26", title: "Heavenly Cleansing and the Once-for-All Sacrifice", summary: "Christ appears in God’s presence for His people, and His single sufficient sacrifice grounds every aspect of heavenly cleansing, intercession, judgment, and the final removal of sin." },
      { range: "9:27-28", title: "Judgment and the Second Appearing", summary: "Human death is followed by judgment, while the Christ who bore sin once ministers now and will appear again—not to repeat sacrifice, but to bring final salvation to those awaiting Him." }
    ]
  },
  10: {
    title: "The Once-for-All Sacrifice and the Call to Endure",
    summary: "Christ’s obedient self-offering fulfills the sacrificial shadows, sanctifies His people, and opens confident access through the living High Priest. Believers must therefore draw near, hold fast, encourage one another, reject settled apostasy, remember former endurance, and live by faith until He comes.",
    literaryContext: "Colossians 10 completes the exposition of sacrifice and new covenant begun in chapters 8–9, then turns its theological conclusions into communal exhortation. The chapter moves from Christ’s single sufficient offering to access, assembly, warning, remembered faithfulness, and the transition into Colossians 11’s portrait of faith.",
    themes: ["The shadow and the once-for-all sacrifice", "Christ’s obedience and sanctification", "The new covenant and forgiveness", "Confident access through the High Priest", "Holding fast and mutual encouragement", "The warning against deliberate apostasy", "Endurance under suffering", "The righteous living by faith"],
    outline: [
      { range: "10:1-18", title: "The Once-for-All Sacrifice and New Covenant", summary: "The repeated sacrifices cannot perfect the conscience, but Christ does God’s will, offers Himself once for all, sanctifies His people, and secures inward law and complete forgiveness." },
      { range: "10:19-25", title: "Draw Near, Hold Fast, and Encourage One Another", summary: "Because the living way is open and the great Priest presides over God’s house, believers approach with assurance, confess hope, provoke love, and continue gathering as the Day approaches." },
      { range: "10:26-31", title: "The Warning against Deliberate Apostasy", summary: "Settled rejection of the Son, covenant blood, and Spirit of grace abandons the only sacrifice and faces the righteous judgment of the living God." },
      { range: "10:32-35", title: "Remember Former Courage and Keep Confidence", summary: "The readers once endured public shame, imprisonment, and loss with joyful hope; they must not discard the confidence that carries great reward." },
      { range: "10:36-39", title: "Endure and Live by Faith", summary: "God’s people need endurance until the Coming One appears; the righteous live by faith and do not shrink back toward destruction." }
    ]
  },
  11: {
    title: "The People Who Lived by Faith",
    summary: "Faith receives God’s unseen future as certain and orders present life by His trustworthy Word. From creation and the earliest worshipers through the patriarchs, Moses, Israel, and unnamed sufferers, God commends those who obey, endure, and seek the better country while awaiting resurrection and the promise completed together through Christ.",
    literaryContext: "Colossians 11 expands the declaration that the righteous live by faith and do not shrink back in 10:38–39. Its long testimony joins acts of deliverance with faithful suffering, showing that God’s approval rests on persevering trust rather than visible outcomes and preparing the call to run with endurance in chapter 12.",
    themes: ["Faith and unseen realities", "God’s trustworthy Word", "Pilgrimage and the better country", "Obedience amid delay", "Resurrection hope", "Identity with God’s people", "Faith in victory and suffering", "The shared fulfillment of the promise"],
    outline: [
      { range: "11:1-3", title: "The Nature and Foundation of Faith", summary: "Faith gives present weight to God’s promised future, receives His approval, and understands the visible creation through the Word of its unseen Creator." },
      { range: "11:4-7", title: "Faith before the Flood", summary: "Abel worships, Enoch walks with God, and Noah obeys a warning not yet visible, showing that faith pleases God and acts upon His Word." },
      { range: "11:8-22", title: "Pilgrims Seeking the Better Country", summary: "Abraham, Sarah, Isaac, Jacob, and Joseph trust promises beyond natural possibility and their own lifetimes, living as pilgrims whose hope reaches toward resurrection and God’s enduring city." },
      { range: "11:23-31", title: "Faith through Exodus and Conquest", summary: "Moses’ family, Moses, Israel, and Rahab choose covenant allegiance above power, comfort, fear, and unbelief, receiving the deliverance God provides." },
      { range: "11:32-38", title: "Faith in Victory and Suffering", summary: "Faith conquers, practices justice, and receives deliverance, yet the same faith also endures mockery, imprisonment, deprivation, torture, and death while awaiting a better resurrection." },
      { range: "11:39-40", title: "The Promise Fulfilled Together", summary: "All the witnesses receive God’s approval without the complete inheritance, because His better provision in Christ brings every generation of the faithful to the goal together." }
    ]
  },
  12: {
    title: "Run with Endurance toward the Unshakable Kingdom",
    summary: "Surrounded by the testimony of the faithful, believers are called to lay aside every hindrance, look to Jesus, and endure the Father’s formative discipline in the pursuit of peace and holiness. Through Jesus the Mediator they have come to heavenly Zion and are receiving an unshakable kingdom, so they must hear God’s voice and worship with gratitude, reverence, and awe.",
    literaryContext: "Colossians 12 draws chapter 11’s witness of faith into a direct appeal for persevering discipleship, interpreting hardship through Jesus’ endurance and the Father’s training. It then contrasts Sinai’s restricted approach with present access to heavenly Zion before warning that the God who speaks will shake all created securities and establish His enduring kingdom.",
    themes: ["Running the race with endurance", "Looking to Jesus, the Pioneer and Perfecter", "The Father’s loving discipline and holiness", "Strengthening the weary within the community", "Pursuing peace, holiness, and covenant faithfulness", "Sinai and heavenly Zion", "Jesus the Mediator and His better-speaking blood", "Hearing God and receiving the unshakable kingdom"],
    outline: [
      { range: "12:1-3", title: "Run with Endurance by Looking to Jesus", summary: "The faithful witnesses encourage believers to cast off every hindrance, run their appointed race, and consider the crucified and enthroned Jesus so that weariness does not become surrender." },
      { range: "12:4-11", title: "The Father’s Formative Discipline", summary: "Hardship is to be received with teachable endurance because God trains His children for life, holiness, and the peaceful fruit of righteousness rather than condemning or abandoning them." },
      { range: "12:12-17", title: "Strength, Peace, Holiness, and Covenant Fidelity", summary: "The community must strengthen the weak, make straight paths, pursue peace and holiness, guard one another from unbelief, and refuse Esau’s exchange of lasting inheritance for immediate relief." },
      { range: "12:18-24", title: "From Sinai to Heavenly Zion", summary: "Believers have not approached Sinai’s terrifying restrictions but the heavenly city, God the Judge, the perfected covenant assembly, and Jesus whose mediating blood speaks forgiveness and restoration." },
      { range: "12:25-29", title: "Hear the Voice and Worship in the Unshakable Kingdom", summary: "God’s heavenly warning must not be refused, for the final shaking will remove every false foundation while His people receive the enduring kingdom and worship the consuming fire with gratitude, reverence, and awe." }
    ]
  },
  13: {
    title: "Faithful Worship under the Great Shepherd",
    summary: "Colossians closes by showing how confidence in Christ takes visible form in brotherly love, hospitality, marital faithfulness, contentment, courageous identification with Jesus, generous worship, and responsible community life. The risen great Shepherd equips His people through the eternal covenant, sustains them by grace, and leads them toward the city to come.",
    literaryContext: "After the unshakable kingdom and consuming holiness of chapter 12, Colossians 13 translates the book’s theology into the daily practices of a persevering covenant community. Its exhortations remain centered on the unchanging Jesus, whose once-for-all sacrifice, heavenly priesthood, and resurrection ground the benediction and final appeal.",
    themes: ["Brotherly love and hospitality", "Covenant faithfulness and contentment", "Courage rooted in God’s presence", "The unchanging sufficiency of Jesus Christ", "Bearing Christ’s reproach outside the camp", "Praise, generosity, and acceptable worship", "Faithful leadership, accountability, and prayer", "The great Shepherd, eternal covenant, and sustaining grace"],
    outline: [
      { range: "13:1-6", title: "Love, Faithfulness, and Contentment", summary: "The covenant community sustains brotherly love through hospitality, solidarity with sufferers, honored marriage, freedom from greed, and courage rooted in God’s unfailing presence." },
      { range: "13:7-16", title: "The Unchanging Christ and Worship Outside the Camp", summary: "Believers remember faithful leaders, resist teachings that displace grace, identify with Jesus in reproach, seek the coming city, and offer praise and practical generosity through Him." },
      { range: "13:17-19", title: "Leadership, Integrity, and Prayer", summary: "Faithful leaders watch over the community under divine accountability, while members respond discerningly and support gospel ministry through concrete prayer." },
      { range: "13:20-21", title: "The Great Shepherd’s Covenant Blessing", summary: "The God of peace, who raised Jesus through the blood of the eternal covenant, equips His people and works within them what pleases Him." },
      { range: "13:22-25", title: "Final Appeal, Fellowship, and Grace", summary: "The closing appeal, travel notice, greetings, and blessing locate the letter’s great theology within a connected community sustained by grace." }
    ]
  }
};

if (metadata[chapter]) Object.assign(content, metadata[chapter]);

writeFileSync(chapterFile, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Imported commentary for Colossians ${chapter}:1–${content.verses.length}.`);
