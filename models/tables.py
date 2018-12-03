import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    date = datetime.datetime.now()
    formattedDate = date.strftime("%b. %d")
    return formattedDate

# TODO: store image(s) into this table
db.define_table('pet',
                Field('pet_title', 'text'),
                Field('pet_description', default="No Description"),
                Field('pet_type', 'text'),
                Field('pet_owner_email'),
                Field('pet_image_URL', 'text'),
                Field('pet_owner_phone_number'),
                Field('pet_price'),
                Field('pet_date', default=get_current_time())
                )

# Requests

db.define_table('requests',
				Field('pet_id'),
				Field('petOwnerEmail'),
				Field('petRenterEmail')
				)



