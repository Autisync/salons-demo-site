/*!
 * Every photo on the five pages, in one place, so each can be checked and
 * swapped. They are hot-linked from the Pexels CDN (free to use). `id` is the
 * Pexels photo id (https://www.pexels.com/photo/<id>/); `subject` is what the
 * photo shows, from its Pexels page. Pages use <img data-photo="key">;
 * build.mjs writes the src from this map, and every image sits on a gradient
 * in the brand's colours in case a photo doesn't load.
 */
window.PHOTOS = {
  // Maré Hair & Beauty (salon)
  salonHero:     { id: 7440133,  subject: 'A stylist blow-drying a woman\'s hair' },
  salonColour:   { id: 3993323,  subject: 'Woman getting her hair coloured' },
  salonSalon:    { id: 3993312,  subject: 'Woman at the salon' },
  salonTint:     { id: 4981476,  subject: 'Close-up of hair colour being applied' },
  salonStyling:  { id: 8467969,  subject: 'A person styling a woman\'s hair' },
  salonWaves:    { id: 3065171,  subject: 'A woman\'s styled hair, from behind' },
  salonLashes:   { id: 5128220,  subject: 'A lash artist working on a woman\'s eyelashes' },

  // Cotton & Steel Barber Co. (barber)
  barberHero:    { id: 7518731,  subject: 'A barber cutting a client\'s hair' },
  barberChair:   { id: 2035227,  subject: 'Man cutting a client\'s hair in a barber\'s chair' },
  barberShave:   { id: 897265,   subject: 'Barber shaving a customer' },
  barberBeard:   { id: 7518732,  subject: 'A barber cutting a client\'s beard' },
  barberShop:    { id: 8218487,  subject: 'Barber shop interior' },
  barberRazor:   { id: 4625615,  subject: 'A barber shaving a man\'s beard' },
  barberSmile:   { id: 2061820,  subject: 'Smiling barber cutting a man\'s hair inside the shop' },

  // Gloss Club Nail Studio (nails)
  nailsHero:     { id: 6954960,  subject: 'A person applying nail polish to someone\'s fingernails' },
  nailsColour:   { id: 5871823,  subject: 'Hands with colourful nail polish' },
  nailsMani:     { id: 6135685,  subject: 'A person getting a manicure' },
  nailsRed:      { id: 3997386,  subject: 'Hand with red nail polish' },
  nailsPedi:     { id: 17056221, subject: 'Close-up of a pedicure being done' },
  nailsArt:      { id: 7066258,  subject: 'Hand with colourful nails' },
  nailsTech:     { id: 19988191, subject: 'Woman painting nails at a beautician\'s' },

  // Hollow Moon Tattoo (tattoo)
  tattooHero:    { id: 5088482,  subject: 'Close-up of a man tattooing a person\'s arm' },
  tattooArtist:  { id: 7005673,  subject: 'A tattoo artist working on a client' },
  tattooMachine: { id: 6593371,  subject: 'Close-up of a vintage tattoo machine' },
  tattooInk:     { id: 6593392,  subject: 'Tattooer sitting and pouring ink' },
  tattooStudio:  { id: 15987322, subject: 'The interior of a tattoo shop' },
  tattooBack:    { id: 7005799,  subject: 'A woman with full back tattoos' },
  tattooWrist:   { id: 4979507,  subject: 'Black and white tattoo on a wrist' },
  tattooShoulder:{ id: 7005670,  subject: 'Tattoo machine on a client\'s shoulder' },
};
window.photoUrl = function (key, w) {
  var p = window.PHOTOS[key];
  return p ? 'https://images.pexels.com/photos/' + p.id + '/pexels-photo-' + p.id + '.jpeg?auto=compress&cs=tinysrgb&w=' + (w || 1200) : '';
};
