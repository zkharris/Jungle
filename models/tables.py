import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

# Pet

# TODO: store image(s) into this table
db.define_table('pet',
                Field('petName', 'text'),
                Field('petDescription', default="No Description"),
                Field('petType', 'text'),
                Field('petOwnerEmail'),
                Field('petImageURL', 'text')
                )

# Requests

db.define_table('requests',
				Field('pet_id'),
				Field('petOwnerEmail'),
				Field('petRenterEmail')
				)


