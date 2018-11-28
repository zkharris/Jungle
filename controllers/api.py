@auth.requires_login()
def add_pet():
	db.pet.insert(
		petName = request.vars.pet_name,
		petDescription = request.vars.pet_description,
		petType = request.vars.pet_type,
		petOwnerEmail = auth.user.email
	)
	return "🐶"