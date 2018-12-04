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
	print(result)

	return response.json(dict(current_user=result))
	



