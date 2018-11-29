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

	rows = db.select(db.pets.ALL)

	for row in rows:
		results.append(dict(
			id=row.pets.id,
			pet_name=row.pets.pet_title,
			pet_description=row.pets.pet_description,
			pet_type=row.pets.pet_type,
			pet_image_url=row.pets.pet_image_URL,
			pet_price=row.pets.pet_price,
			pet_date=row.pets.pet_date
		))

	return response.json(dict(pet_list=results))
