@auth.requires_login()
def add_pet():
	db.pet.insert(
		pet_title = request.vars.pet_title,
		pet_description = request.vars.pet_description,
		pet_type = request.vars.pet_type,
		pet_owner_email = auth.user.email,
		pet_image_URL = request.vars.pet_image_url,
		pet_owner_phone_number = request.vars.pet_owner_phone_number,
		pet_price = request.vars.pet_price
	)
	return "🐶"

def get_pets_list():
	results = []

	rows = db().select(db.pet.ALL, orderby=~db.pet.pet_utc_date)

	for row in rows:
		results.append(dict(
			id=row.id,
			pet_title=row.pet_title,
			pet_description=row.pet_description,
			pet_type=row.pet_type,
			pet_image_url=row.pet_image_URL,
			pet_price=row.pet_price,
			pet_date=row.pet_date
		))

	return response.json(dict(pet_list=results))

def get_pet_data():
	pet_id = int(request.vars.pet_id)

	pet_row = db(db.pet.id == pet_id).select().first()
	pet_result = dict(
				id = pet_row.id,
				pet_title = pet_row.pet_title,
				pet_description = pet_row.pet_description,
				pet_type = pet_row.pet_type,
				pet_image_url = pet_row.pet_image_URL,
				pet_price = pet_row.pet_price,
				pet_owner_phone_number = pet_row.pet_owner_phone_number,
				pet_owner_email = pet_row.pet_owner_email,
				pet_date = pet_row.pet_date
			   )

	return response.json(dict(pet=pet_result)) 

def get_pets_query():
	results = []
	query = request.vars.query

	rows = db((db.pet.pet_title.lower() == query.lower()) | (db.pet.pet_type.lower() == query.lower())).select(orderby=~db.pet.pet_utc_date)

	for row in rows:
		results.append(dict(
			id=row.id,
			pet_title=row.pet_title,
			pet_description=row.pet_description,
			pet_type=row.pet_type,
			pet_image_url=row.pet_image_URL,
			pet_price=row.pet_price,
			pet_date=row.pet_date
		))

	return response.json(dict(pet_list=results))

def get_current_user():
	result = auth.user.email if auth.is_logged_in() else None

	return response.json(dict(current_user=result))


def get_pet_owner():
	pet_id = int(request.vars.petID)
	pet = db(pet_id == db.pet.id).select().first()

	if auth.user is not None: 
		if pet.pet_owner_email == auth.user.email:
			return response.json(dict(result=1))

	return response.json(dict(result=0))

@auth.requires_login()
def delete_pet():
	print("trying to delete pet")
	pet_id = int(request.vars.petID)

	db((db.pet.id == pet_id) & (db.pet.pet_owner_email == auth.user.email)).delete()

	return "😭"

@auth.requires_login()
def add_message():
	channel_id = int(request.vars.channelID)	
	pet_id = int(request.vars.petID)
	message_content = (request.vars.messageContent)
	
	pet_owner_email = db((pet_id == db.pet.id)).select().first().pet_owner_email
	chat_row = db((pet_id == db.chat.pet_post) & (db.chat.pet_requester_email == auth.user.email)).count()
	chat_row_id = None

	# if user is owner
	if auth.user.email == pet_owner_email:
		db.message.insert(
			chat_id = channel_id,
			message_sender_email = auth.user.email,
			message_content = message_content
		)
		chat_row_id = channel_id
	else:
		# First message, chat row does not exist
		if chat_row == 0:
			db.chat.insert(
				pet_post = pet_id,
				pet_requester_email = auth.user.email,
				pet_owner_email = pet_owner_email
			)
			chat_row_id = db((pet_id == db.chat.pet_post) & (db.chat.pet_requester_email == auth.user.email)).select().first().id
	
			# add the message to the new chat table
			db.message.insert(
				chat_id = chat_row_id,
				message_sender_email = auth.user.email,
				message_content = message_content
			)
	
		# chat row does exist
		else:
			chat_row_id = db((pet_id == db.chat.pet_post) & (db.chat.pet_requester_email == auth.user.email)).select().first().id
			db.message.insert(
				chat_id = chat_row_id,
				message_sender_email = auth.user.email,
				message_content = message_content
			)
	
	return response.json(dict(channel_id=chat_row_id))

@auth.requires_login()
def get_chat_channels():
	print("getting_chat_channels")
	results = []
	pet_id = int(request.vars.petID)
	pet = db(pet_id == db.pet.id).select().first()
	channel_id = 0

	# if user is owner of post
	if pet.pet_owner_email == auth.user.email:
		print("is an owner")
		channel_rows = db((pet_id == db.chat.pet_post)).select()
		for row in channel_rows:
			results.append(dict(
				id = row.id,
				pet_requester_email = row.pet_requester_email
			))
		return response.json(dict(channels_list=results))

	# if user is not owner of post
	else:
		print("not an owner")
		# if chat exists between user and owner
		if db((pet_id == db.chat.pet_post) &
				(auth.user.email == db.chat.pet_requester_email) &
				(pet.pet_owner_email == db.chat.pet_owner_email)).count() > 0:
			print("There is a chat")
			channel_id = db((pet_id == db.chat.pet_post) &
				(auth.user.email == db.chat.pet_requester_email) &
				(pet.pet_owner_email == db.chat.pet_owner_email)).select().first().id
		else:
			print("There is not a chat")
		# channel_id = db((pet_id == db.chat.pet_post) & (auth.user.email == db.chat.pet_requester_email)).select().first().id
	
	print("channel_id: ", channel_id)
	return response.json(dict(channel_id=int(channel_id)))

@auth.requires_login()
def get_messages():
	results = []
	# if there is no chat return empty dict
	if request.vars.chatID is None: 
		return response.json(dict(message_list=results))

	chat_id = int(request.vars.chatID)
	
	message_rows = db(chat_id == db.message.chat_id).select(orderby=db.message.message_utc_date)

	for row in message_rows: 
		results.append(dict(
			id=row.id,
			message_sender_email=row.message_sender_email,
			message_content=row.message_content,
			message_utc_date=row.message_utc_date,
			message_date=row.message_date
		))

	return response.json(dict(message_list=results))

