const { create, Client } = require('@open-wa/wa-automate')
const fs = require('fs-extra')
const kconfig = require('./config')
const options = require('./lib/options')
const { color, sleep } = require('./lib/functions')
const config = require('./lib/config/Bot/config.json')
const canvas = require('discord-canvas')
const { mylang } = require('./lib/lang')
const axios = require('axios')
const irisvs = require('./package.json')
var welcOn = 0;var abayo = 0

// Quantidade máxima de Backups do Level.json e MsgCount.json
const maxBackups = Math.floor(Math.random() * 5) + 1

// Apaga a pasta de cache do Chrome caso exista
if (fs.existsSync('./logs/Chrome')) { fs.rmdirSync('./logs/Chrome', { recursive: true }) }

// Cria um cliente de inicialização da BOT
const start = async (kill = new Client()) => {
	const getversion = await axios.get('https://raw.githubusercontent.com/KillovSky/iris/main/package.json')
	if (irisvs.version !== getversion.data.version) { console.log(color('\n[UPDATE]', 'crimson'), color(`Uma nova versão da Íris foi lançada [${getversion.data.version}], atualize para obter melhorias e correções! → ${irisvs.homepage}`, 'gold')) }
	console.log(color('\n[SUPORTE]', 'magenta'), color(`https://bit.ly/3owVJoB | +55 18 99804-4132 | ${irisvs.bugs.url}\n`, 'lime'), color(`\n[ÍRIS ${irisvs.version}]`, 'magenta'), color('Estamos prontos para começar mestre!\n', 'lime'))
	
	// Backup do Level.json & MsgCount.json toda vez que religar a BOT
	const levelBk = JSON.parse(fs.readFileSync('./lib/config/Bot/level.json'))
	const messBk = JSON.parse(fs.readFileSync('./lib/config/Bot/msgcount.json'))
	await fs.writeFileSync(`./lib/config/Bot/Backup/level-${maxBackups}.json`, JSON.stringify(levelBk))
	await fs.writeFileSync(`./lib/config/Bot/Backup/msgcount-${maxBackups}.json`, JSON.stringify(messBk))
	
	// Forçar recarregamento caso obtenha erros
	kill.onStateChanged(async (state) => {
		console.log(color('[RELOAD]', 'red'), color('Isso pode ser ignorado →', 'lime'), color(state, 'yellow'))
		if (state === 'UNPAIRED' || state === 'CONFLICT' || state === 'UNLAUNCHED') await kill.forceRefocus()
	})

	// Lê as mensagens e limpa cache a cada 3000, se quiser menos só editar ali
	kill.onMessage(async (message) => {
		await kill.getAmountOfLoadedMessages().then(async (msg) => {
			if (msg >= 3000) {
				console.log(color('[CACHE]', 'red'), color('Recebemos 3000 mensagens! Limpando o cache delas...', 'yellow'))
				await kill.cutMsgCache()
				console.log(color('[CACHE]', 'red'), color('O cache das mensagens foi totalmente limpo!', 'lime'))
			}
		})
		await kconfig(kill, message)
	})

	// Funções para caso seja adicionada em um grupo
	kill.onAddedToGroup(async (chat) => {
		const lmtgru = await kill.getAllGroups()
		const totalMem = chat.groupMetadata.participants.length
		if (chat.groupMetadata.participants.includes(config.owner)) {
			await kill.sendText(chat.id, mylang().novogrupo())
		} else if (totalMem < config.memberReq) {
			await kill.sendText(chat.id, mylang().noreq(totalMem))
			await kill.deleteChat(chat.id)
			await kill.leaveGroup(chat.id)
		} else if (lmtgru.length > config.gpLimit) {
			await kill.sendText(chat.id, mylang().cheio(lmtgru))
			await kill.deleteChat(chat.id)
			await kill.leaveGroup(chat.id)
		} else { kill.sendText(chat.id, mylang().novogrupo()) }
		console.log(color('[NOVO]', 'red'), color(`Fui adicionada ao grupo ${chat.contact.name} e eles tem ${totalMem} membros.`, 'yellow'))
	})

	// Configuração do welcome
	kill.onGlobalParticipantsChanged(async (event) => {
		const welkom = JSON.parse(fs.readFileSync('./lib/config/Grupos/welcome.json'))
		const bklist = JSON.parse(fs.readFileSync('./lib/config/Bot/anti.json'))
		const anti = JSON.parse(fs.readFileSync('./lib/config/Grupos/blacklist.json'))
		const fks = JSON.parse(fs.readFileSync('./lib/config/Grupos/fake.json'))
		const personr = event.who
		const numebot = await kill.getHostNumber() + '@c.us'
		const isMyBot = personr.includes(numebot)
		const ddi = config.ddi
		const isWelkom = welkom.includes(event.chat)
		const isFake = fks.includes(event.chat)
		const fake = personr.startsWith(ddi)
		const isAnti = anti.includes(event.chat)
		const fuck = bklist.includes(event.who)
		const eChat = await kill.getContact(event.who)
		let { pushname, verifiedName, formattedName } = eChat
		pushname = pushname || verifiedName || formattedName
		const gChat = await kill.getChatById(event.chat)
		const { contact, groupMetadata, name } = gChat
		try {
			if (event.action == 'add') {
				await kill.sendText(event.chat, `E TU TA AQUI MENÓ?! TU TA AQUI DNV MENÓ??`)
						await sleep(2000)
						await kill.removeParticipant(event.chat, event.who)
						console.log(color('[BLACKLIST]', 'red'), color(`${pushname} - (${event.who.replace('@c.us', '')}) foi banido do ${name} por ter sido colocado na blacklist...`, 'yellow'))
					} else if (isFake && !fake && !isMyBot) {
						await kill.sendTextWithMentions(event.chat, `Olá @${event.who.replace('@c.us', '')}, como parte de nuestro sistema de seguridad, los números de fuera de Brasil están prohibidos, si no eres alguien malo y quieres estar en el grupo pacíficamente, por favor contacta a los administradores 😉.\n\nHello @${event.who.replace('@c.us', '')}, as part of our security system, numbers outside Brazil are banned, if you are not someone bad and want to be in the group peacefully, please contact the administrators 😉.\n\nHalo @${event.who.replace('@c.us', '')}, sebagai bagian dari sistem keamanan kami, nomor di luar Brasil dilarang, jika Anda bukan orang jahat dan ingin berada di grup dengan damai, silakan hubungi administrator 😉.\n\nHola @${event.who.replace('@c.us', '')}, como parte de nuestro sistema de seguridad, los números fuera de Brasil están prohibidos, si no eres alguien malo y quieres estar en el grupo pacíficamente, por favor contacte a los administradores 😉.`)
						await sleep(4000)
						await kill.removeParticipant(event.chat, event.who)
						console.log(color('[FAKE]', 'red'), color(`${pushname} - (${event.who.replace('@c.us', '')}) foi banido do ${name} por usar número falso ou ser de fora do país...`, 'yellow'))
					} else if (isWelkom && !isMyBot) {
						var profile = await kill.getProfilePicFromServer(event.who)
						if (profile == '' || profile == undefined) profile = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQcODjk7AcA4wb_9OLzoeAdpGwmkJqOYxEBA&usqp=CAU'
						const welcomer = await new canvas.Welcome()
							.setUsername(pushname)
							.setDiscriminator(event.who.substring(6, 10))
							.setMemberCount(groupMetadata.participants.length)
							.setGuildName(name)
							.setAvatar(profile)
							.setColor('border', '#00100C')
							.setColor('username-box', '#00100C')
							.setColor('discriminator-box', '#00100C')
							.setColor('message-box', '#00100C')
							.setColor('title', '#00FFFF')
							.setBackground('https://i.pinimg.com/originals/3d/4b/03/3d4b033c01c30b714f8710a57f46d900.jpg')
							.toAttachment()
							//await kill.sendPtt(event.chat, `./lib/media/audio/welcome.mp3`)
						const base64 = `data:image/png;base64,${welcomer.toBuffer().toString('base64')}`
						await kill.sendFile(event.chat, base64, 'welcome.png', `*❐❯─᤻─⃟᤻─᤻─᤻─᤻─᤻「⃞🌎⃞」─᤻─᤻─᤻─⃟᤻─᤻─᤻❮❐*\n\nBienvenido ${pushname}! A\n*┏━┅┅┅┅┅┅┄⟞⟦⟝┉┉┅┅┅┅━┓*\n${name}\n*┗━┅┅┅┅┅┅┅┄⟞⟦⟝┅┅┅┉┉━┛*\n\n_*Deseo que te diviertas y que sigas nuestras reglas!*_ ✅ \n\n*S᤻i᤻ n᤻e᤻c᤻e᤻s᤻it᤻a᤻ a᤻y᤻᤻u᤻d᤻a᤻*\n*❐⃟✓* Comuniquese con un administrador\n*❐⃟✓* Escriba ${config.prefix}menu para ver las opciones`)
						console.log(color('[ENTROU]', 'red'), color(`${pushname} - (${event.who.replace('@c.us', '')}) entro al grupo ${name}...`, 'yellow'))
					}
				} else if (event.action == 'remove' && isWelkom && !isMyBot) {
					var profile = await kill.getProfilePicFromServer(event.who)
					if (profile == '' || profile == undefined) profile = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQcODjk7AcA4wb_9OLzoeAdpGwmkJqOYxEBA&usqp=CAU'
					const bye = await new canvas.Goodbye()
						.setUsername(pushname)
						.setDiscriminator(event.who.substring(6, 10))
						.setMemberCount(groupMetadata.participants.length)
						.setGuildName(name)
						.setAvatar(profile)
						.setColor('border', '#00100C')
						.setColor('username-box', '#00100C')
						.setColor('discriminator-box', '#00100C')
						.setColor('message-box', '#00100C')
						.setColor('title', '#00FFFF')
						.setBackground('https://fondosmil.com/fondo/67366.jpg')
						.toAttachment()
					const base64 = `data:image/png;base64,${bye.toBuffer().toString('base64')}`
					await kill.sendFile(event.chat, base64, 'welcome.png', `Disfrutamos mucho de su estadia en el grupo ${pushname}\nEsperamos volver a verlo pronto,bye.`)
					console.log(color('[SAIU/BAN]', 'red'), color(`${pushname} - (${event.who.replace('@c.us', '')}) se fue o fue expulsado del grupo ${name}...`, 'yellow'))
				}
		} catch (err) { console.log(err);welcOn = 0;abayo = 0 }
	})

	// Bloqueia na call
	kill.onIncomingCall(async (callData) => {
		await kill.sendText(callData.peerJid, mylang().blockcalls())
		await kill.contactBlock(callData.peerJid)
		console.log(color('[CALL]', 'red'), color(`${callData.peerJid.replace('@c.us', '')} foi bloqueado por me ligar...`, 'yellow'))
	})

}

// Cria uma sessão da Íris
create(options(start)).then((kill) => start(kill)).catch((err) => console.error(err))
