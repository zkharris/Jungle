import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

def get_formatted_date():
    date = datetime.datetime.now()
    formattedDate = date.strftime("%b. %d")
    return formattedDate

def get_message_formatted_date():
    date = datetime.datetime.now()
    formattedDate = date.strftime("%B %d, %-I:%M%p")
    return formattedDate


# MARK: Pet

db.define_table('pet',
                Field('pet_title', 'text'),
                Field('pet_description', default="No Description"),
                Field('pet_type', 'text'),
                Field('pet_owner_email'),
                Field('pet_image_URL', 'text'),
                Field('pet_owner_phone_number'),
                Field('pet_price'),
                Field('pet_date', default=get_formatted_date()),
                Field('pet_utc_date', default=get_current_time())
                )

# MARK: Chat
# pet_post = pet.id

db.define_table('chat',
                Field('pet_post'),
                Field('pet_requester_email'),
                Field('pet_owner_email'),
                )

# MARK: Message
# chat_id = chat.id
db.define_table('message',
                Field('chat_id'),
                Field('message_sender_email'),
                Field('message_content'),
                Field('message_utc_date', default=get_current_time()),
                Field('message_date', default=get_message_formatted_date())
                )



