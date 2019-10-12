import EXIF from 'exif-js'

export const fetchImageAsFeatures = () => {
  const baseUrl = 'https://arcgis.github.io/arcgis-samples-javascript/sample-data/featurelayer-collection/photo-'
  const tasks = []
  for (let i = 1; i < 18; i++) {
    tasks.push(exifToGraphic(`${baseUrl}${i}.jpg`, i))
  }
  return Promise.all(tasks)
}

function exifToGraphic (url, id) {
  const dmsDD = ([degrees, minutes, seconds], direction) => {
    let dd = degrees + minutes / 60 + seconds / 3600
    if (direction === "S" || direction === "W") {
      dd *= -1
    }
    return dd
  }

  return new Promise(function (resolve, reject) {
    const image = document.createElement("img")
    image.src = url;
    image.onload = function () {
      image.load = image.onerror = null
      EXIF.getData(image, function () {
        const latitude = EXIF.getTag(this, "GPSLatitude")
        const latitudeDirection = EXIF.getTag(this, "GPSLatitudeRef")
        const longitude = EXIF.getTag(this, "GPSLongitude")
        const longitudeDirection = EXIF.getTag(this, "GPSLongitudeRef")

        if (!latitude || !longitude) {
          reject(new Error("Photo doesn't contain GPS information: ", this.src))
          return
        }

        resolve({
          geometry: {
            latitude: dmsDD(latitude, latitudeDirection),
            longitude: dmsDD(longitude, longitudeDirection)
          },
          attributes: {
            url: url,
            OBJECTID: id
          }
        })
      })
    }

    image.onerror = function () {
      image.load = image.onerror = null
      reject(new Error("Error while loading the image"))
    }
  })
}