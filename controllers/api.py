@auth.requires_login()
def add_pet():
	db.pet.insert(
		petName = request.vars.pet_name,
		petDescription = request.vars.pet_description,
		petType = request.vars.pet_type,
		petOwnerEmail = auth.user.email,
		petImageURL = request.vars.pet_image_url,
		petOwnerPhoneNumber = request.vars.pet_owner_phone_number
	)
	return "🐶"


